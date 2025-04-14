import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorToastProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, isVisible, onDismiss }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-destructive text-white px-4 py-3 rounded-md shadow-lg flex items-center z-50">
      <AlertCircle className="h-5 w-5 mr-2" />
      <span>{message}</span>
      <Button 
        variant="ghost" 
        size="icon" 
        className="ml-3 p-1 hover:bg-white hover:bg-opacity-20 rounded-full text-white"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ErrorToast;
