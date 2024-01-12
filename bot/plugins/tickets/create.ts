import {
  ActionRowBuilder,
  ButtonInteraction,
  DiscordAPIError,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionsBitField,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { TFindReturn, findPairedAccount } from './verification';
import prisma from '../../lib/prisma';
import { client } from '../../client';

type TCreateTicket = {
  categoryId: string;
  userId: string;
  guildId: string;
  interaction?: ButtonInteraction | ModalSubmitInteraction;
};
export const _createTicket = async ({ categoryId, guildId, userId, interaction }: TCreateTicket) => {
  if (!client.user?.id) return { error: true, message: 'Internal server error' };

  const [user, guildData] = await Promise.all([
    client.guilds.cache.get(guildId)?.members.fetch(userId),
    prisma.guild.findUnique({
      where: { guildId },
      include: {
        ticketCategories: {
          include: {
            tickets: {
              where: {
                AND: [
                  { authorDiscordId: userId },
                  {
                    closedAt: {
                      equals: null,
                    },
                  },
                ],
              },
            },
            supportRoles: true,
            _count: {
              select: {
                tickets: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const category = guildData?.ticketCategories.find(({ id }) => id === categoryId);
  const guild = client.guilds.cache.get(guildId);

  if (!user?.id || !guildData?.id || !category || !guild?.id) {
    return { error: true, message: 'Bad request' };
  }

  const {
    createConfirmation: _createConfirmation,
    limit,
    format,
    parentChannelId,
    name: categoryName,
    bannedRoleId,
    supportRoles,
    steamRequired,
  } = category;

  if (user.roles.cache.some((role) => role.id === bannedRoleId)) {
    return { error: true, message: 'You are not allowed to create a ticket!' };
  }

  let pairedData: TFindReturn;
  if (steamRequired) {
    const pairedAccount = await findPairedAccount(user.id);
    if (typeof pairedAccount === 'boolean') {
      return { error: true, message: 'Your game account is not paired with Discord!' };
    }
    pairedData = pairedAccount;
  }

  const createConfirmation = _createConfirmation && _createConfirmation?.length >= 4 ? _createConfirmation : false;

  if (createConfirmation && interaction instanceof ButtonInteraction) {
    const modal = new ModalBuilder()
      .setTitle('Confirmation')
      .setCustomId(`${client.user.id}|ticket:confirm-${categoryId}`);
    const confirmInput = new TextInputBuilder()
      .setCustomId(`${client.user.id}|ticket:modal-${category.id}`)
      .setLabel('Type "yes" to confirm and create a ticket')
      .setPlaceholder(createConfirmation)
      .setMinLength(3)
      .setMaxLength(3)
      .setStyle(TextInputStyle.Paragraph);
    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(confirmInput);

    modal.addComponents(row);

    await interaction.showModal(modal);
    return { success: true, message: 'Modal opened' };
  }

  const userOpenedTickets = category.tickets.length;
  if (userOpenedTickets + 1 > limit) {
    return {
      error: true,
      message: `You have reached your ticket limit! Close the previous ticket${
        userOpenedTickets >= 2 ? 's' : ''
      } to open a new one.`,
    };
  }

  const ticketCount = (guildData.ticketCategories[1]._count.tickets + 1).toString();

  const ticketFormat = format
    .replace(/#user/gi, user.user.username)
    .replace(/#category/gi, categoryName)
    .replace(/#index/gi, ticketCount);

  let chn;
  try {
    const ticketChn = await guild.channels.create({
      name: ticketFormat,
      parent: parentChannelId ?? undefined,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: client.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
      ],
    });
    chn = ticketChn;

    if (supportRoles.length >= 1) {
      for (const role of supportRoles) {
        await ticketChn.permissionOverwrites.edit(role.roleId, { ViewChannel: true });
      }
    }
    await ticketChn.permissionOverwrites.edit(guild.roles.everyone.id, { ViewChannel: false });

    // TODO
  } catch (error) {
    if (chn?.id) await chn.delete().catch(() => {});
    if (error instanceof DiscordAPIError) {
      return { error: true, message: error.message };
    }
    console.log(error);
  }
};
