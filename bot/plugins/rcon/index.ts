import prisma from '../../lib/prisma';
import { Rcon } from 'rcon-client';

type TCommand = {
  serverId: number;
  command: string;
};
/**
 * Connect to the game server RCON and send a command
 */
const rconCommand = async ({ command, serverId }: TCommand) => {
  const [server, password] = await Promise.all([
    prisma.server.findFirst({
      where: {
        id: serverId,
      },
    }),
    getRconPassword(),
  ]);
  if (!server || !password) {
    return null;
  }

  const { rconPort, multiHome } = server;

  const rcon = new Rcon({
    host: multiHome ?? '127.0.0.1',
    password: password,
    port: rconPort,
    timeout: 6000,
  });

  await rcon.connect();

  const response = await rcon.send(command);

  await rcon.end();

  return response;
};

const getRconPassword = async () => {
  const config = await prisma.config.findFirst();
  return config?.rconPassword;
};

export default rconCommand;
