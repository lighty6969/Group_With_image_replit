import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useChat } from '@/hooks/useChat';
import MessageInput from '@/components/MessageInput';
import RoomInfo from '@/components/RoomInfo';
import { Message, MessageType } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile as useMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ThemeToggle';

const ChatRoom: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isMobile = useMobile();
  
  const {
    roomId,
    username,
    isConnected,
    isJoining,
    users,
    messages,
    messagesEndRef,
    joinRoom,
    leaveRoom,
    sendMessage,
    copyRoomId,
    formattedCreationTime,
  } = useChat();
  
  const [showInfo, setShowInfo] = useState(!isMobile);
  
  // Join room when component mounts if not already in a room
  useEffect(() => {
    if (!roomId && params.id && isConnected) {
      joinRoom(params.id);
    }
  }, [roomId, params.id, isConnected, joinRoom]);

  // Redirect to home if no roomId in URL
  useEffect(() => {
    if (!params.id) {
      setLocation('/');
    }
  }, [params.id, setLocation]);
  
  // Handle leave room confirmation
  const handleLeaveRoom = () => {
    const confirmation = window.confirm('Are you sure you want to leave this room?');
    if (confirmation) {
      leaveRoom();
    }
  };
  
  // Toggle room info sidebar on mobile
  const toggleInfo = () => {
    setShowInfo(prev => !prev);
  };
  
  // Format message timestamp
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render message based on its type
  const renderMessage = (message: Message) => {
    if (message.isSystem) {
      if (message.content.includes('joined')) {
        return (
          <div key={message.id} className="message-join">
            {message.content}
          </div>
        );
      } else if (message.content.includes('left')) {
        return (
          <div key={message.id} className="message-leave">
            {message.content}
          </div>
        );
      } else {
        return (
          <div key={message.id} className="message-system">
            {message.content}
          </div>
        );
      }
    }
    
    const isCurrentUser = message.username === username;
    
    return (
      <div key={message.id} className={isCurrentUser ? "message-self" : "message-others"}>
        <div className={`flex items-center space-x-1 ${isCurrentUser ? "self-end" : ""}`}>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {isCurrentUser ? (
              <>
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatTime(message.timestamp)}</span>
                <span className="ml-1 text-xs font-medium text-primary">You ({message.username})</span>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{message.username}</span>
                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">{formatTime(message.timestamp)}</span>
              </>
            )}
          </span>
        </div>
        <div className={isCurrentUser ? "message-bubble-self" : "message-bubble-others"}>
          {/* Message content based on type */}
          {message.type === MessageType.IMAGE && message.imageUrl ? (
            <>
              {message.content && <p className="mb-2">{message.content}</p>}
              <img 
                src={message.imageUrl} 
                alt={`Image shared by ${message.username}`}
                className="message-image"
                loading="lazy"
              />
            </>
          ) : (
            message.content
          )}
        </div>
      </div>
    );
  };
  
  if (!roomId || !username) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-lg font-medium text-gray-800 dark:text-gray-100">Joining room...</div>
          <div className="mt-3 w-24 h-1 bg-primary/60 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-primary text-white py-3 px-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-medium">Room: <span>{roomId}</span></h1>
          <p className="text-xs">
            You are <span>{username}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <div className="flex items-center ml-2" title="People in room">
            <span className="material-icons text-sm mr-1">people</span>
            <span>{users.length}</span>
          </div>
          <button 
            className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-3 py-1 text-sm"
            onClick={handleLeaveRoom}
          >
            <span className="material-icons text-sm mr-1">logout</span>
            Leave
          </button>
          <button 
            className={`${isMobile ? 'flex' : 'hidden'} items-center bg-white bg-opacity-20 hover:bg-opacity-30 rounded p-1`}
            onClick={toggleInfo}
          >
            <span className="material-icons text-sm">info</span>
          </button>
        </div>
      </header>
      
      <div className="flex flex-grow overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-grow h-full relative">
          {/* Messages Container */}
          <div className="message-area flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            <div className="text-center py-2 px-4 text-xs text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-full inline-block mx-auto">
              Welcome to the room! Messages will disappear when everyone leaves.
            </div>
            
            {messages.map((message) => renderMessage(message))}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <MessageInput onSendMessage={sendMessage} />
        </div>
        
        {/* Room Info Sidebar (Desktop) / Modal (Mobile) */}
        <RoomInfo 
          roomId={roomId}
          users={users}
          username={username}
          visible={showInfo}
          onClose={() => isMobile && setShowInfo(false)}
          onCopyRoomId={copyRoomId}
          creationTime={formattedCreationTime()}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
