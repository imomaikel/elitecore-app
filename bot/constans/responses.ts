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
      success: 'Widget sent';
    };
    data: never;
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
