import type { Guild, GuildMember } from 'discord.js';
import logger from '../scripts/logger';
import { client } from '../client';

type TCheckForRole = {
  userOrId: GuildMember | string;
  guildOrId: Guild | string;
  roleId: string;
};
/**
 * Check if a user has a selected role
 */
export const checkForRole = async ({ roleId, userOrId, guildOrId }: TCheckForRole): Promise<boolean> => {
  const guild = typeof guildOrId === 'string' ? client.guilds.cache.get(guildOrId) : guildOrId;
  if (!guild) return false;
  const user = typeof userOrId === 'string' ? await guild.members.fetch(userOrId) : userOrId;
  if (!user) {
    logger({
      message: 'Failed to fetch user',
      type: 'error',
    });
    return false;
  }
  const hasRole = user.roles.cache.some((role) => role.id === roleId);
  return hasRole;
};
