import { TEnvVars } from '../constans';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file
const envFilePath = resolve(process.cwd(), '.env');
config({ path: envFilePath });

// Find .env by name
const findEnv = (name: string): string => {
  const env = process.env[name];
  if (!env) {
    if (name === 'NODE_ENV') return 'development';
    console.log(`Failed to get '${name}' env variable.`);
    process.exit(0);
  }
  return env;
};

// Get .env with autocomplete
export const getEnv = (name: TEnvVars) => findEnv(name);
