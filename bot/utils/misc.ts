const DAY = 86400,
  HOUR = 3600,
  MINUTE = 60;

export const playTimeToText = (seconds: number) => {
  const days = Math.floor(seconds / DAY);
  const hours = Math.floor((seconds - days * DAY) / HOUR);
  const minutes = Math.floor((seconds - days * DAY - hours * HOUR) / MINUTE);
  const stringTable = [];
  if (days >= 2) stringTable.push(`${days} days`);
  else if (days === 1) stringTable.push(`${days} day`);
  if (hours >= 2) stringTable.push(`${hours} hours`);
  else if (hours === 1) stringTable.push(`${hours} hour`);
  if (days === 0 && hours === 0) {
    if (minutes >= 2) stringTable.push(`${minutes} minutes`);
    else if (minutes === 1) stringTable.push(`${minutes} minute`);
  }
  const playTimeString = stringTable.join(' ');
  return playTimeString;
};
