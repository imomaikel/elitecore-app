import { Separator } from '@/shared/components/ui/separator';
import ActionButton from '@/components/shared/ActionButton';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { errorToast } from '@/shared/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/trpc';

type TSendMessage = {
  ticketId: string;
};
const SendMessage = ({ ticketId }: TSendMessage) => {
  const [message, setMessage] = useState('');

  const { mutate: sendMessage, isLoading } = trpc.sendMessage.useMutation();

  const onSend = () => {
    if (message.length <= 0) return errorToast('Message is empty!');
    sendMessage(
      {
        content: message,
        ticketId,
      },
      {
        onSuccess: ({ message: responseMessage, status }) => {
          if (status === 'success') {
            toast.success(responseMessage);
            setMessage('');
          } else {
            errorToast(responseMessage);
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  return (
    <>
      <Separator className="mt-6 mb-4" />
      <div>
        <Label htmlFor="message">Send a new message</Label>
        <Textarea
          disabled={isLoading}
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={1}
        />
        <ActionButton onClick={onSend} disabled={isLoading} className="mt-2 max-w-sm w-full">
          Send!
        </ActionButton>
      </div>
    </>
  );
};

export default SendMessage;
