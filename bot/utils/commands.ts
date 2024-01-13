import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';

export type CommandExecute = (client: Client, interaction: ChatInputCommandInteraction) => Promise<unknown>;
export type Command = {
  execute: CommandExecute;
  body: Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>;
};

export function command(
  body: Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>,
  execute: CommandExecute,
): Command {
  return { body, execute };
}
