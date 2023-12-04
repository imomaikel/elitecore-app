import { checkForRole } from '../../helpers/permissions';
import { errorEmbed } from '../../constans/embeds';
import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { guilds } from '@prisma/client';

type TCheckPermissions = {
  guildData: guilds | null;
  interaction: ButtonInteraction | StringSelectMenuInteraction;
};
export const hasPermissionToControl = async ({ guildData, interaction }: TCheckPermissions): Promise<boolean> => {
  // Check if guild control role is set
  if (!guildData || !guildData.serverControlRoleId) {
    await interaction
      .editReply({
        embeds: [errorEmbed('The widget access role is not set.\nHead over to the web panel to manage it.')],
      })
      .then((reply) => {
        setTimeout(() => {
          reply.delete().catch(() => {});
        }, 30_000);
      });
    return false;
  }

  // Check if a user has permission to do the action
  const hasRole = await checkForRole({
    roleId: guildData.serverControlRoleId,
    guildOrId: interaction.guild!,
    userOrId: interaction.user.id,
  });
  if (!hasRole) {
    await interaction
      .editReply({
        embeds: [errorEmbed('You do not have the role to control this widget.')],
      })
      .then((reply) => {
        setTimeout(() => {
          reply.delete().catch(() => {});
        }, 30_000);
      });
    return false;
  }
  return true;
};
