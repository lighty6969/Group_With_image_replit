import React from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useChat } from '@/hooks/useChat';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const chatContext = useChat();
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <WelcomeScreen 
        onJoinRoom={chatContext.joinRoom}
        isJoining={chatContext.isJoining}
      />
    </div>
  );
}
