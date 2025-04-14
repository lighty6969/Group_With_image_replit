import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSendMessage: (message: string) => boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    
    const success = onSendMessage(trimmedMessage);
    if (success) {
      setMessage('');
    }
  };

  return (
    <div className="p-3 bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..." 
          className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
          autoComplete="off"
        />
        <Button 
          type="submit" 
          size="icon"
          className="bg-primary text-white rounded-full p-2 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
