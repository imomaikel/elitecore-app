import { client } from '../client';

/**
 * Returns all of the possible roles that the bot can see
 * @param guildId Discord Server ID
 */
const apiAvailableRoles = async (guildId: string) => {
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild || !client.user?.id) return null;

    const response = (await guild.roles.fetch()).map((role) => ({
      roleName: role.name,
      roleId: role.id,
    }));

    return response.length > 0 ? response : null;
  } catch (error) {
    return null;
  }
};

export default apiAvailableRoles;
