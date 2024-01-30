/* eslint-disable */
const { execSync } = require('child_process');

// first two args can be ignored rest will be passed directly to the npm command
const [ignore, ignore2, ...args] = process.argv;

// windowsHide option will hide the cmd window
execSync(`npm ${args.join(' ')}`, { windowsHide: true, stdio: 'inherit' });

// https://github.com/Unitech/pm2/issues/3657#issuecomment-926890502