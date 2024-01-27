import {
  ActionRowBuilder,
  ButtonInteraction,
  DiscordAPIError,
  EmbedBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionsBitField,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
  hyperlink,
} from 'discord.js';
import { changeMapEmbed, enteredCoordsEmbed, selectedMapEmbed } from '../../constans/embeds';
import { TFindReturn, findPairedAccount } from './verification';
import { CustomResponse } from '../../constans/responses';
import { createWebhook } from '../../scripts/webhook';
import { colors, extraSigns } from '../../constans';
import logger from '../../scripts/logger';
import { getEnv } from '../../utils/env';
import { Ticket } from '@prisma/client';
import { client } from '../../client';
import prisma from '../../lib/prisma';

type TCreateTicket = {
  categoryId: string;
  userId: string;
  guildId: string;
  interaction?: ButtonInteraction | ModalSubmitInteraction;
  forceCoords?: string;
  forceServerId?: number;
};
export const _createTicket = async ({
  categoryId,
  guildId,
  userId,
  interaction,
  forceCoords,
  forceServerId,
}: TCreateTicket): Promise<CustomResponse<'ticketCreate'>> => {
  if (!client.user?.id) return { status: 'error', details: { message: 'Something went wrong' } };

  const [user, guildData, userData] = await Promise.all([
    client.guilds.cache.get(guildId)?.members.fetch({ user: userId, force: true }),
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
          },
        },
      },
    }),
    prisma.user.findUnique({ where: { discordId: userId } }),
  ]);

  const category = guildData?.ticketCategories.find(({ id }) => id === categoryId);
  const guild = client.guilds.cache.get(guildId);

  if (!user?.id || !guildData?.id || !category || !guild?.id) {
    return { status: 'error', details: { message: 'Bad request' } };
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
    afterCreateDescription,
    description,
    coordinateInput,
    mapSelection,
    closeCommand,
    mentionSupport,
    image,
    autoClose,
  } = category;

  if (user.roles.cache.some((role) => role.id === bannedRoleId)) {
    return { status: 'error', details: { message: 'You are not allowed to create a ticket!' } };
  }

  const userOpenedTickets = category.tickets.length;
  if (userOpenedTickets + 1 > limit) {
    return {
      status: 'error',
      details: { message: 'You have reached your ticket limit! Close the previous ticket to open a new one.' },
    };
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
    return { status: 'success', details: { message: 'Modal opened', data: { inviteLink: null, ticketId: null } } };
  }

  let pairedData: TFindReturn[] | undefined;
  if (steamRequired) {
    const pairedAccount = await findPairedAccount(user.id);
    if (typeof pairedAccount === 'boolean') {
      return { status: 'error', details: { message: 'Your game account is not paired with Discord!' } };
    }
    pairedData = pairedAccount;
  }

  let chn: TextChannel | undefined, ticket: Ticket | undefined;
  try {
    const ticketChn = await guild.channels.create({
      name: 'ticket',
      parent: parentChannelId && parentChannelId.length >= 4 ? parentChannelId : undefined,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.SendMessages],
        },
        {
          id: client.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
      ],
    });
    chn = ticketChn;

    const webhook = await createWebhook(ticketChn.id);
    if (!webhook) throw new Error('Could not create a webhook');

    if (supportRoles.length >= 1) {
      for (const role of supportRoles) {
        await ticketChn.permissionOverwrites.edit(role.roleId, { ViewChannel: true });
      }
    }
    await ticketChn.permissionOverwrites.edit(guild.roles.everyone.id, { ViewChannel: false });

    const welcomeEmbed = new EmbedBuilder()
      .setColor(colors.purple)
      .setDescription(afterCreateDescription ?? description)
      .setFooter({ text: `If you do not send a message within ${autoClose} minutes, the ticket will be closed` });

    if (image) welcomeEmbed.setImage(image);

    const command = closeCommand && closeCommand.length >= 2 ? closeCommand : '$close';

    const howToClose = new EmbedBuilder()
      .setColor(colors.purple)
      .setAuthor({ name: 'How to close the ticket?' })
      .setDescription(`Type at any time \`${command}\` to close the ticket ${extraSigns.zap}`);

    const howToAddMember = new EmbedBuilder()
      .setColor(colors.purple)
      .setAuthor({ name: 'How to add other members to this ticket?' })
      .setDescription(
        `Use the \`/add\` command and enter a username that will be added to this ticket ${extraSigns.zap}`,
      );

    if (mentionSupport) {
      await ticketChn
        .send('@here')
        .then((msg) => msg.delete())
        .catch(() => {});
    }
    await ticketChn.send({
      embeds: [welcomeEmbed, howToClose, howToAddMember],
    });

    const inviteUrl = (
      await chn.createInvite({
        maxAge: 14 * 24 * 60 * 60,
      })
    ).url;

    const steamId = pairedData?.find((entry) => entry.method === 'STEAM')?.id ?? undefined;
    const eosID = pairedData?.find((entry) => entry.method === 'EOS')?.id ?? undefined;
    await prisma.$transaction(async (tx) => {
      const openedTickets = await tx.ticket.count({
        where: {
          closedAt: null,
          authorDiscordId: userId,
          ticketCategoryId: categoryId,
        },
      });
      if (openedTickets !== userOpenedTickets) {
        throw new Error('Concurrent task');
      }
      ticket = await prisma.ticket.create({
        data: {
          authorDiscordId: user.id,
          channelId: ticketChn.id,
          guildId: guild.id,
          authorUsername: user.user.username,
          categoryName: category.name,
          inviteUrl,
          webhookId: webhook.id,
          webhookToken: webhook.token,
          authorSteamId: steamId,
          authorEOSId: eosID,
          ...(userData?.id && {
            User: {
              connect: {
                id: userData.id,
              },
            },
          }),
          TicketCategory: {
            connect: {
              id: categoryId,
            },
          },
        },
      });
    });
    let ticketCount = '1';
    if (format.includes('#index')) {
      const getCount = await prisma.ticketCategory.findUnique({
        where: { id: categoryId },
        select: {
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      });
      if (getCount) {
        ticketCount = getCount._count.tickets.toString();
      }
    }
    const ticketFormat = format
      .replace(/#user/gi, user.user.username)
      .replace(/#category/gi, categoryName)
      .replace(/#index/gi, ticketCount);
    await ticketChn.setName(ticketFormat);

    if (!ticket) return { status: 'error', details: { message: 'Something went wrong' } };

    let infoDescription = `View the ticket online ${hyperlink(
      'here',
      `${getEnv('NEXT_PUBLIC_SERVER_URL')}/dashboard/tickets/${ticket.id}`,
    )}`;
    if (steamRequired) {
      if (steamId) {
        infoDescription += `\nSteam ID: \`${steamId}\``;
      }
      if (eosID) {
        infoDescription += `\nEOS ID: \`${eosID}\``;
      }
    }
    const infoEmbed = new EmbedBuilder()
      .setColor(colors.purple)
      .setAuthor({ name: 'Information' })
      .setDescription(infoDescription);
    await ticketChn.send({ embeds: [infoEmbed] });

    if (coordinateInput || mapSelection) {
      if (coordinateInput) {
        if (forceCoords) {
          await ticketChn.send({ embeds: [enteredCoordsEmbed(forceCoords)] });
          await prisma.ticket.update({
            where: { channelId: ticketChn.id },
            data: {
              coordinates: forceCoords,
            },
          });
        } else {
          const coordsEmbed = new EmbedBuilder().setColor(colors.blue)
            .setDescription(`:warning: For this ticket, we need your in-game coordinates.
          Please follow the instructions below. 
          :octagonal_sign: :octagonal_sign: **Any other messages will be deleted unless the coordinates are specified.** :octagonal_sign: :octagonal_sign: 
        **1.** Stand at the location you want to copy your ccc-cords from. 
        **2.** Type "ccc" in the tab menu and press enter. You won't see anything happen, but your coordinates are now "copied"
        **3.** You can now select all and paste your cords (ctrl + a and then ctrl + v)
        `);

          await ticketChn
            .send({
              embeds: [coordsEmbed],
            })
            .then(async (msg) => {
              await prisma.ticket.update({
                where: { id: ticket!.id },
                data: { coordinatesMessageId: msg.id },
              });
            });
        }
      }
      if (mapSelection) {
        const mapEmbed = new EmbedBuilder().setColor(colors.blue).setDescription('**Select your game map**');
        const servers = await prisma.server.findMany();
        if (servers.length <= 0) {
          return {
            status: 'success',
            details: { message: 'Ticket created', data: { inviteLink: inviteUrl, ticketId: ticket.id } },
          };
        }
        const select = new StringSelectMenuBuilder()
          .setCustomId(`${client.user?.id}|ticket:map-${categoryId}`)
          .setPlaceholder('Click to open');

        const options: StringSelectMenuOptionBuilder[] = [];

        for (const server of servers) {
          const label = server.customName && server.customName.length >= 4 ? server.customName : server.mapName;
          const optionDescription = `ARK: ${server.gameType} (${server.gameMode})`;

          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(label.replace(/_/gi, ' '))
              .setDescription(optionDescription)
              .setValue(server.id.toString()),
          );
        }

        select.addOptions(...options);
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

        const selectedServer = forceServerId ? servers.find((entry) => entry.id === forceServerId) : undefined;

        if (selectedServer && forceServerId) {
          await ticketChn
            .send({
              embeds: [
                selectedMapEmbed({
                  customName: selectedServer.customName,
                  gameType: selectedServer.gameType,
                  mapName: selectedServer.mapName,
                }),
              ],
            })
            .then(async (msg) => {
              const customName =
                selectedServer.customName && selectedServer.customName.length >= 3
                  ? `${selectedServer.customName.replace(/_/gi, ' ')} / `
                  : '';
              await prisma.ticket.update({
                where: { id: ticket!.id },
                data: { mapNameSelectedMessageId: msg.id, mapName: `${customName}${selectedServer.mapName}` },
              });
            });
        }

        await ticketChn
          .send({
            embeds: [forceServerId && selectedServer ? changeMapEmbed() : mapEmbed],
            components: [row],
          })
          .then(async (msg) => {
            await prisma.ticket.update({
              where: { id: ticket!.id },
              data: { mapNameMessageId: msg.id },
            });
          });
      }
    }
    return {
      status: 'success',
      details: { message: 'Ticket created', data: { inviteLink: inviteUrl, ticketId: ticket.id } },
    };
  } catch (error: any) {
    if (chn?.id) await chn.delete().catch(() => {});
    if (error instanceof DiscordAPIError) {
      return {
        status: 'error',
        details: {
          message: error.message.includes('Missing Permissions') ? 'The bot has no permission' : 'Something went wrong',
        },
      };
    }
    if (ticket?.id) {
      await prisma.ticket.delete({
        where: { id: ticket.id },
      });
    }
    if (error?.message !== 'Concurrent task') {
      logger({
        message: 'Ticket Error',
        type: 'error',
        data: error,
        file: 'create.ts',
      });
    } else {
      return {
        status: 'error',
        details: { message: 'You have reached your ticket limit! Close the previous ticket to open a new one.' },
      };
    }
    return { status: 'error', details: { message: 'Something went wrong' } };
  }
};
