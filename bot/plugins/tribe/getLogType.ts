import { LogType } from '@prisma/client';

const {
  Auto_destroyed,
  Claimed,
  Deaths,
  Demolished,
  Dino_deaths,
  Downloaded,
  Froze,
  Groups,
  Kills,
  Logged_in,
  Logged_out,
  Neutered,
  Other,
  Soul,
  Starved,
  Tamed,
  Transferred,
  Trapped,
  Tribe_management,
  Uploaded,
  You_destroyed_structure,
  Your_structure_destroyed,
} = LogType;

/* prettier-ignore */
export const _getLogType = (content: string) => {
  if (content.includes('destroyed your') || (content.includes('Your') && content.includes('was destroyed'))) return Your_structure_destroyed;
  if (content.includes('destroyed their') || content.includes('Your Tribe destroyed')) return You_destroyed_structure;
  if (content.includes('Tribemember') && content.includes('was killed')) return Deaths;
  if (content.includes('has logged out')) return Logged_out;
  if (content.includes('logged into')) return Logged_in;
  if (content.includes('was demoted') || content.includes('Tribe Owner') || content.includes('was removed from the Tribe') || content.includes('was added to the Tribe') || content.includes('promoted') || content.includes('tribe was merged')) return Tribe_management;
  if (content.includes('set Rank Group') || content.includes('set to Rank Group')) return Groups;
  if (content.includes('Your') && content.includes('was killed')) return Dino_deaths;
  if (content.includes('unclaimed') || content.includes('claimed')) return Claimed;
  if (content.includes('Soul') && content.includes('destroyed')) return Soul;
  if (content.includes('froze') && content.includes('- Lvl')) return Froze;
  if (content.includes('auto-decay destroyed')) return Auto_destroyed;
  if (content.includes('downloaded a dino')) return Downloaded;
  if (content.includes('Your Tribe killed')) return Kills;
  if (content.includes('starved to death')) return Starved;
  if (content.includes('has transferred')) return Transferred;
  if (content.includes('demolished')) return Demolished;
  if (content.includes('uploaded')) return Uploaded;
  if (content.includes('neutered')) return Neutered;
  if (content.includes('trapped')) return Trapped;
  if (content.includes('Tamed a')) return Tamed;
  return Other;
};
