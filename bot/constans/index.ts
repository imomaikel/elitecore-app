import path from 'path';

export type TEnvVars =
  | 'DISCORD_DEVELOPMENT_BOT_TOKEN'
  | 'DISCORD_PRODUCTION_BOT_TOKEN'
  | 'NODE_ENV'
  | 'EXCHANGE_RATES_API_URL'
  | 'NEXT_PUBLIC_SERVER_URL'
  | 'DATABASE_USER'
  | 'DATABASE_PASSWORD'
  | 'DATABASE_HOST'
  | 'DATABASE_SCHEMA'
  | 'DEVELOPMENT_DISCORD_GUILD_ID'
  | 'PRODUCTION_DISCORD_GUILD_ID';

// https://flatuicolors.com/
export const colors = {
  red: 0xea2027,
  green: 0x2ecc71,
  blue: 0x0652dd,
  purple: 0x8e44ad,
};

export const extraSigns = {
  zap: '⚡️',
  space: 'ㅤ',
  star: '💫',
  family: '👪',
  redCircle: '🔴',
  ticket: '🎫',
};

export const gifs = {
  pulseUrl:
    'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWF6ODZvZHI2ZGVpZzJxd3F3OWJhY2xhaTk5ZHR3a2E0dWF6NXpqcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/ftDgm9sclqbRWKiBR4/giphy.gif',
  loadingUrl:
    'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTk0eGJkc2c2bTN3MzYwMzVheDYwemRlZXQzZ2o0NjRpN3B6dGloYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/zlcIBNopQj8Yx5QgpR/giphy.gif',
  loadingWithTextUrl:
    'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTk0eGJkc2c2bTN3MzYwMzVheDYwemRlZXQzZ2o0NjRpN3B6dGloYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/zlcIBNopQj8Yx5QgpR/giphy.gif',
};

export const specialAvatar = 'https://i.imgur.com/XKVc85s.jpg';
export const avatars = {
  blueAvatar: 'https://i.imgur.com/YeenaYA.png',
  cyanAvatar: 'https://i.imgur.com/i2hZE4N.png',
  greenAvatar: 'https://i.imgur.com/rXmb2Dt.png',
  mixedAvatar: 'https://i.imgur.com/EQ6einb.png',
  defaultAvatar: 'https://i.imgur.com/ginJJWR.png',
  pinkAvatar: 'https://i.imgur.com/vNeP6Y7.png',
};
export const randomAvatar = () => Object.values(avatars)[Math.floor(Math.random() * Object.keys(avatars).length)];

export const ATTACHMENTS_PATH = path.resolve(process.cwd(), 'attachments');
