import { GuildBasedChannel } from 'discord.js';

// Define a custom response for each plugin
type PluginResponses = {
  sendMessage: {
    status: {
      error: 'The bot has no permission' | 'Could not find the channel' | 'Unknown error';
      success: 'Message sent' | 'Message edited';
    };
    data: {
      error?: never;
      success: {
        messageId: string;
      };
    };
  };
  broadcaster: {
    status: {
      error:
        | 'The bot has no permission'
        | 'Could not find the channel'
        | 'Unknown error'
        | 'The widget channel does not exist'
        | 'The widget channel is not set'
        | 'User has no permission'
        | 'The channel does not exist'
        | 'Bad request';
      success: 'Widget sent' | 'Verified';
    };
    data: {
      error?: never;
      success: {
        channel?: GuildBasedChannel;
      };
    };
  };
  ticketWidget: {
    status: {
      error:
        | 'Internal Server Error'
        | 'There are no ticket categories created'
        | 'The ticket widget channel is not set'
        | 'Bad request';
      success: 'Widget sent';
    };
    data: never;
  };
  ticketCreate: {
    status: {
      error:
        | 'Something went wrong'
        | 'Bad request'
        | 'Your game account is not paired with Discord!'
        | 'You are not allowed to create a ticket!'
        | 'The bot has no permission'
        | 'You have reached your ticket limit! Close the previous ticket to open a new one.';
      success: 'Modal opened' | 'Ticket created';
    };
    data: {
      error: never;
      success: {
        inviteLink: string | null;
        ticketId: string | null;
      };
    };
  };
};

// Function return type that will allow you to go through all possible options
export type CustomResponse<T extends keyof PluginResponses> =
  | {
      status: 'success';
      details?: T extends keyof PluginResponses
        ? {
            message: PluginResponses[T]['status']['success'];
            data: PluginResponses[T]['data']['success'];
          }
        : never;
    }
  | {
      status: 'error';
      details?: T extends keyof PluginResponses
        ? {
            message: PluginResponses[T]['status']['error'];

            data?: PluginResponses[T]['data']['error'];
          }
        : never;
    };

export type Plugins = keyof PluginResponses;
