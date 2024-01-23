import { sendMessage } from '../../helpers/sendMessage';
import { colors, randomAvatar } from '../../constans';
import { EmbedBuilder, time } from 'discord.js';
import prisma from '../../lib/prisma';
import { client } from '../../client';
import { restartCountdown } from '.';

export const _countdownWidget = async (guildId: string) => {
  const guildData = await prisma.guild.findUnique({
    where: { guildId },
    select: {
      countdownDescription: true,
      countdownChannelId: true,
      countdownHeader: true,
      countdownLastDate: true,
      countdownNextDate: true,
      countdownMessageId: true,
    },
  });

  if (!guildData?.countdownChannelId || !guildData.countdownNextDate) {
    return {
      status: 'error',
      details: {
        message: 'The widget channel is not set',
      },
    };
  }
  const { countdownChannelId, countdownHeader, countdownLastDate, countdownMessageId, countdownNextDate } = guildData;
  let { countdownDescription } = guildData;

  const widget = new EmbedBuilder()
    .setColor(colors.purple)
    .setThumbnail(randomAvatar())
    .setTimestamp()
    .setFooter({ text: 'Updated' });

  widget.setAuthor({ name: countdownHeader, iconURL: client.user?.displayAvatarURL() });

  const countdownInMinutes = Math.round((countdownNextDate.getTime() - new Date().getTime()) / 60_000);

  if (countdownInMinutes <= 0) {
    await restartCountdown(guildId);
    return;
  }

  const days = Math.floor(countdownInMinutes / (24 * 60));
  const hours = Math.floor((countdownInMinutes - days * 24 * 60) / 60);
  const minutes = Math.floor(countdownInMinutes - days * 24 * 60 - hours * 60);

  if (countdownLastDate) {
    countdownDescription = countdownDescription
      .replace('<old/t>', time(countdownLastDate, 't'))
      .replace('<old/T>', time(countdownLastDate, 'T'))
      .replace('<old/d>', time(countdownLastDate, 'd'))
      .replace('<old/D>', time(countdownLastDate, 'D'))
      .replace('<old/f>', time(countdownLastDate, 'f'))
      .replace('<old/F>', time(countdownLastDate, 'F'))
      .replace('<old/R>', time(countdownLastDate, 'R'));
  }
  countdownDescription = countdownDescription
    .replace('<new/t>', time(countdownNextDate, 't'))
    .replace('<new/T>', time(countdownNextDate, 'T'))
    .replace('<new/d>', time(countdownNextDate, 'd'))
    .replace('<new/D>', time(countdownNextDate, 'D'))
    .replace('<new/f>', time(countdownNextDate, 'f'))
    .replace('<new/F>', time(countdownNextDate, 'F'))
    .replace('<new/R>', time(countdownNextDate, 'R'));

  countdownDescription = countdownDescription.replace(/\\n/gi, '\n');

  widget.setDescription(countdownDescription);

  if (days >= 1) {
    widget.addFields({
      name: ':regional_indicator_d::regional_indicator_a::regional_indicator_y::regional_indicator_s:',
      value: `**${days} day${days > 1 ? 's' : ''}**`,
      inline: true,
    });
  }
  if (hours >= 1) {
    widget.addFields({
      name: ':regional_indicator_h::regional_indicator_o::regional_indicator_u::regional_indicator_r::regional_indicator_s:',
      value: `**${hours} hour${hours > 1 ? 's' : ''}**`,
      inline: true,
    });
  }
  if (minutes >= 1) {
    widget.addFields({
      name: ':regional_indicator_m::regional_indicator_i::regional_indicator_n::regional_indicator_u::regional_indicator_t::regional_indicator_e::regional_indicator_s:',
      value: `**${minutes} minute${minutes > 1 ? 's' : ''}**`,
      inline: true,
    });
  }

  const action = await sendMessage({
    channelOrId: countdownChannelId,
    editMessageId: countdownMessageId,
    messageEmbeds: [widget],
  });

  if (action.status === 'success') {
    const messageId = action.details?.data.messageId;
    if (messageId) {
      await prisma.guild.update({
        where: { guildId },
        data: {
          countdownMessageId: messageId,
        },
      });
    }
  }

  return action;
};
