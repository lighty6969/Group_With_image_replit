import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  createSocketConnection, 
  sendMessage, 
  addMessageHandler, 
  removeMessageHandler,
  closeConnection
} from '@/lib/socket';
import { 
  WebSocketMessageType, 
  Message, 
  MessageType,
  RoomUser,
  Room
} from '@shared/schema';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

interface UseChatProps {
  initialRoomId?: string;
  initialUsername?: string;
}

export function useChat({ initialRoomId, initialUsername }: UseChatProps = {}) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for room information
  const [roomId, setRoomId] = useState<string | null>(initialRoomId || null);
  const [username, setUsername] = useState<string | null>(initialUsername || null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomCreatedAt, setRoomCreatedAt] = useState<Date | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to show error toast
  const showError = useCallback((message: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  }, [toast]);
  
  // Effect to establish WebSocket connection
  useEffect(() => {
    createSocketConnection()
      .then(() => {
        setIsConnected(true);
      })
      .catch((error) => {
        showError('Failed to connect to server');
        console.error('Connection error:', error);
      });
    
    // Clean up WebSocket connection on unmount
    return () => {
      closeConnection();
    };
  }, [showError]);
  
  // Setup message handlers for WebSocket messages
  useEffect(() => {
    // Handle join room response
    const handleJoinRoomResponse = (payload: any) => {
      setIsJoining(false);
      if (payload.success) {
        setUsername(payload.username);
        setRoomId(payload.roomId);
        setMessages(payload.messages || []);
        setRoomCreatedAt(new Date(payload.createdAt));
        setLocation(`/room/${payload.roomId}`);
      } else {
        showError(payload.message || 'Failed to join room');
      }
    };
    
    // Handle user joined
    const handleUserJoined = (payload: any) => {
      const { user, message } = payload;
      
      // Add the join message
      if (message) {
        setMessages(prev => [...prev, message]);
      }
    };
    
    // Handle user left
    const handleUserLeft = (payload: any) => {
      const { username, timestamp } = payload;
      
      // Create a system message for user leaving
      const leaveMessage: Message = {
        id: `leave-${Date.now()}`,
        roomId: roomId!,
        username: 'System',
        content: `${username} left the room`,
        timestamp: new Date(timestamp),
        type: MessageType.SYSTEM,
        isSystem: true
      };
      
      setMessages(prev => [...prev, leaveMessage]);
    };
    
    // Handle new message
    const handleNewMessage = (payload: Message) => {
      setMessages(prev => [...prev, payload]);
    };
    
    // Handle room users update
    const handleRoomUsers = (payload: any) => {
      setUsers(payload.users || []);
    };
    
    // Handle errors
    const handleError = (payload: any) => {
      if (payload.status === 'error') {
        showError(payload.message);
      }
    };
    
    // Register all handlers
    addMessageHandler(WebSocketMessageType.JOIN_ROOM, handleJoinRoomResponse);
    addMessageHandler(WebSocketMessageType.USER_JOINED, handleUserJoined);
    addMessageHandler(WebSocketMessageType.USER_LEFT, handleUserLeft);
    addMessageHandler(WebSocketMessageType.NEW_MESSAGE, handleNewMessage);
    addMessageHandler(WebSocketMessageType.ROOM_USERS, handleRoomUsers);
    addMessageHandler(WebSocketMessageType.ERROR, handleError);
    
    // Cleanup handlers on unmount
    return () => {
      removeMessageHandler(WebSocketMessageType.JOIN_ROOM, handleJoinRoomResponse);
      removeMessageHandler(WebSocketMessageType.USER_JOINED, handleUserJoined);
      removeMessageHandler(WebSocketMessageType.USER_LEFT, handleUserLeft);
      removeMessageHandler(WebSocketMessageType.NEW_MESSAGE, handleNewMessage);
      removeMessageHandler(WebSocketMessageType.ROOM_USERS, handleRoomUsers);
      removeMessageHandler(WebSocketMessageType.ERROR, handleError);
    };
  }, [roomId, showError, setLocation]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Join a room
  const joinRoom = useCallback((roomIdToJoin: string, usernameToUse?: string) => {
    if (!isConnected) {
      showError('Not connected to server');
      return;
    }
    
    setIsJoining(true);
    sendMessage(WebSocketMessageType.JOIN_ROOM, {
      roomId: roomIdToJoin,
      username: usernameToUse
    });
  }, [isConnected, showError]);
  
  // Send a message to the current room
  const sendChatMessage = useCallback((content: string, type = MessageType.TEXT, imageUrl?: string) => {
    if (!isConnected || !roomId) {
      showError('Not connected to a room');
      return false;
    }
    
    const messagePayload: any = {
      roomId,
      content,
      type
    };
    
    // Add image URL for image messages
    if (type === MessageType.IMAGE && imageUrl) {
      messagePayload.imageUrl = imageUrl;
    }
    
    return sendMessage(WebSocketMessageType.SEND_MESSAGE, messagePayload);
  }, [isConnected, roomId, showError]);
  
  // Leave the current room
  const leaveRoom = useCallback(() => {
    if (roomId) {
      closeConnection();
      setRoomId(null);
      setUsername(null);
      setUsers([]);
      setMessages([]);
      setRoomCreatedAt(null);
      setLocation('/');
      
      // Reconnect to server for future use
      createSocketConnection().catch(() => {
        // Silent catch as we'll show errors on the home page
      });
    }
  }, [roomId, setLocation]);
  
  // Format room creation time
  const formattedCreationTime = useCallback(() => {
    if (!roomCreatedAt) return '';
    return formatDistanceToNow(roomCreatedAt, { addSuffix: true });
  }, [roomCreatedAt]);
  
  // Copy room ID to clipboard
  const copyRoomId = useCallback(async () => {
    if (!roomId) return;
    
    try {
      await navigator.clipboard.writeText(roomId);
      toast({
        title: "Room ID copied!",
        description: "The room ID has been copied to your clipboard.",
        duration: 2000,
      });
    } catch (err) {
      showError('Failed to copy room ID');
    }
  }, [roomId, toast, showError]);
  
  return {
    // State
    roomId,
    username,
    isConnected,
    isJoining,
    users,
    messages,
    roomCreatedAt,
    messagesEndRef,
    
    // Actions
    joinRoom,
    leaveRoom,
    sendMessage: sendChatMessage,
    copyRoomId,
    
    // Utils
    formattedCreationTime,
  };
}
