import { EmbedBuilder } from 'discord.js';
import { colors } from '.';

export const errorEmbed = (description: string, toUsername?: string) => {
    const embed = new EmbedBuilder()
        .setColor(colors.red)
        .setDescription(
            toUsername ? `Hey, ${toUsername}!\n${description}` : description,
        )
        .setTimestamp();
    return embed;
};

export const successEmbed = (description: string, toUsername?: string) => {
    const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setDescription(
            toUsername ? `Hey, ${toUsername}!\n${description}` : description,
        )
        .setTimestamp();
    return embed;
};
