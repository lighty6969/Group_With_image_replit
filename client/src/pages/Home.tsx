import React from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const chatContext = useChat();
  
  return (
    <div className="flex flex-col h-screen">
      <WelcomeScreen 
        onJoinRoom={chatContext.joinRoom}
        isJoining={chatContext.isJoining}
      />
    </div>
  );
}
