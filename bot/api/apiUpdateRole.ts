import prisma from '../lib/prisma';
import { client } from '../client';

type TApiUpdateRole = {
  roleId: string;
  guildId: string;
  userDiscordId: string;
  widget: 'serverControlRole';
};
export const apiUpdateRole = async ({ guildId, roleId, userDiscordId, widget }: TApiUpdateRole): Promise<boolean> => {
  try {
    const guild = client.guilds.cache.get(guildId);
    const role = await guild?.roles.fetch(roleId);
    if (role?.id) {
      if (widget === 'serverControlRole') {
        await prisma.guild.update({
          where: { guildId },
          data: {
            serverControlRoleId: role.id,
            logs: {
              create: {
                content: `Changed server control role to "${role.name}"`,
                Author: {
                  connect: {
                    discordId: userDiscordId,
                  },
                },
              },
            },
          },
        });
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};
