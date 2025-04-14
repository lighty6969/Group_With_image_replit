import React, { useState, useRef } from 'react';
import { Send, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageType } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSendMessage: (message: string, type?: MessageType, imageUrl?: string) => boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    
    // If we have an image URL and optionally a message
    if (imageUrl) {
      const success = onSendMessage(
        trimmedMessage || 'Shared an image', 
        MessageType.IMAGE, 
        imageUrl
      );
      if (success) {
        setMessage('');
        setImageUrl(null);
      }
      return;
    }
    
    // Regular text message
    if (!trimmedMessage) return;
    
    const success = onSendMessage(trimmedMessage);
    if (success) {
      setMessage('');
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, GIF)',
        variant: 'destructive'
      });
      return;
    }
    
    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be smaller than 50MB',
        variant: 'destructive'
      });
      return;
    }
    
    // Read and convert file to data URL
    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      toast({
        title: 'Error reading file',
        description: 'Failed to process the image',
        variant: 'destructive'
      });
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
    
    // Reset the file input
    e.target.value = '';
  };

  const cancelImage = () => {
    setImageUrl(null);
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Image preview */}
      {imageUrl && (
        <div className="mb-2 relative">
          <div className="relative inline-block">
            <img 
              src={imageUrl} 
              alt="Upload preview" 
              className="max-h-32 max-w-full rounded-md"
            />
            <button 
              onClick={cancelImage} 
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center"
              title="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={imageUrl ? "Add a caption (optional)..." : "Type a message..."} 
          className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
          autoComplete="off"
        />
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <Button 
          type="button" 
          size="icon"
          onClick={handleFileSelect}
          disabled={isUploading}
          className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
          title="Attach image"
        >
          <Image className="h-5 w-5" />
        </Button>
        
        <Button 
          type="submit" 
          size="icon"
          disabled={isUploading || (!message.trim() && !imageUrl)}
          className="bg-primary text-white rounded-full p-2 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
