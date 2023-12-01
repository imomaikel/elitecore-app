import { errorEmbed, successEmbed } from '../../constans/embeds';
import { ACTIONS, serverSelection } from './serverSelection';
import { checkForRole } from '../../helpers/permissions';
import type { ButtonInteraction } from 'discord.js';
import { updateServerControlWidget } from '.';
import { clientStates } from '../../client';
import prisma from '../../lib/prisma';

export const widgetInUse = async (interaction: ButtonInteraction) => {
    await interaction.reply({
        embeds: [
            errorEmbed(
                'Please wait, another user is using this widget.',
                interaction.user.username,
            ),
        ],
        ephemeral: true,
    });
    return;
};

type TButtonHandler = {
    interaction: ButtonInteraction;
};
/**
 * Handle the server-control button interaction
 */
export const serverControlButtonHandler = async ({
    interaction,
}: TButtonHandler) => {
    try {
        if (!interaction.guild?.id) return;
        const command = interaction.customId.split('|')[1];
        if (!command) return;

        const action = command.split('-')[1];
        // Refresh servers
        if (action === 'refresh') {
            if (clientStates.usingServerControl) {
                return await widgetInUse(interaction);
            }
            await interaction.deferReply();
            const response = await updateServerControlWidget();
            if (response) {
                await interaction
                    .editReply({
                        embeds: [successEmbed('Servers updated!')],
                    })
                    .then((reply) => {
                        setTimeout(() => {
                            reply.delete().catch(() => {});
                        }, 15_000);
                    });
            } else {
                await interaction
                    .editReply({
                        embeds: [
                            errorEmbed(
                                'Something went wrong. Please try again',
                            ),
                        ],
                    })
                    .then((reply) => {
                        setTimeout(() => {
                            reply.delete().catch(() => {});
                        }, 15_000);
                    });
            }
            return;
        }
        // Check if the action is correct
        if (!ACTIONS.includes(action)) return;

        if (clientStates.usingServerControl) {
            return await widgetInUse(interaction);
        }

        await interaction.deferReply();
        const guildData = await prisma.guilds.findFirst({
            where: {
                guildId: interaction.guild.id,
            },
        });
        // Check if guild control role is set
        if (!guildData || !guildData.serverControlRoleId) {
            await interaction
                .editReply({
                    embeds: [
                        errorEmbed(
                            'The widget access role is not set.\nHead over to the web panel to manage it.',
                        ),
                    ],
                })
                .then((reply) => {
                    setTimeout(() => {
                        reply.delete().catch(() => {});
                    }, 30_000);
                });
            return;
        }

        // Check if a user has permission to do the action
        const hasRole = await checkForRole({
            roleId: guildData.serverControlRoleId,
            guildOrId: interaction.guild,
            userOrId: interaction.user.id,
        });
        if (!hasRole) {
            await interaction
                .editReply({
                    embeds: [
                        errorEmbed(
                            'You do not have the role to control this widget.',
                        ),
                    ],
                })
                .then((reply) => {
                    setTimeout(() => {
                        reply.delete().catch(() => {});
                    }, 30_000);
                });
            return;
        }

        clientStates.usingServerControl = true;
        // Show server selection menu
        return await serverSelection({
            action: action,
            interaction,
        });
    } catch (error) {
        clientStates.usingServerControl = false;
        updateServerControlWidget();
        if (interaction.isButton() && interaction.deferred) {
            await interaction.deleteReply().catch(() => {});
        }
    }
};
