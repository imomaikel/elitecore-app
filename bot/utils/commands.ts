import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';

export type CommandExecute = (client: Client, interaction: ChatInputCommandInteraction) => Promise<unknown>;
export type Command = {
  execute: CommandExecute;
  body: SlashCommandBuilder;
};

export function command(body: SlashCommandBuilder, execute: CommandExecute): Command {
  return { body, execute };
}
