import { TSocketNewMessage } from '@/shared/lib/utils';
import { TMessageWithAttachment } from '../Ticket';
import useSocket from '@/hooks/use-socket';
import Message from './Message';

type TMessages = {
  messages: TMessageWithAttachment[];
  onNewMessage: (message: TSocketNewMessage) => void;
};
const Messages = ({ messages, onNewMessage }: TMessages) => {
  useSocket({ eventName: 'newMessage', callback: (socketData) => onSocket(socketData) });

  const onSocket = (socketData: TSocketNewMessage) => {
    onNewMessage(socketData);
  };

  return (
    <div className="flex flex-col">
      {messages.map((entry, index) => (
        <Message key={entry.id} data={entry} lastAuthorId={messages[index - 1]?.authorDiscordId ?? null} />
      ))}
    </div>
  );
};

export default Messages;
