import { client } from './client';

interface botSendMessageProps {
    channelId: string;
    content: string;
}
export const botSendMessage = async ({
    channelId,
    content,
}: botSendMessageProps) => {
    const channel = client.channels.cache.get(channelId);
    if (!channel?.id) {
        return {
            message: 'The channel does not exist.',
            status: 'error',
        };
    }
    if (!channel.isTextBased()) {
        return {
            message: 'Invalid channel type.',
            status: 'error',
        };
    }

    try {
        await channel.send({ content });
    } catch (error) {
        console.log(error);
        return {
            status: 'error',
            message: 'Something went wrong.',
        };
    }

    return {
        message: 'Message sent.',
        status: 'success',
    };
};
