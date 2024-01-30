import { client } from '../client';

export const apiAvatar = async (discordId: string) => {
  const user = await client.users.fetch(discordId).catch(() => null);

  return user?.displayAvatarURL() ?? null;
};
