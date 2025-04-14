import { WebSocketMessage, WebSocketMessageType } from "@shared/schema";

// Socket connection state
let socket: WebSocket | null = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

// Message handlers
type MessageHandler = (payload: any) => void;
const messageHandlers: Record<WebSocketMessageType, MessageHandler[]> = {
  [WebSocketMessageType.JOIN_ROOM]: [],
  [WebSocketMessageType.USER_JOINED]: [],
  [WebSocketMessageType.USER_LEFT]: [],
  [WebSocketMessageType.SEND_MESSAGE]: [],
  [WebSocketMessageType.NEW_MESSAGE]: [],
  [WebSocketMessageType.ROOM_USERS]: [],
  [WebSocketMessageType.ERROR]: []
};

// Creates a WebSocket connection
export const createSocketConnection = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        resolve();
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        isConnected = true;
        reconnectAttempts = 0;
        resolve();
      };
      
      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleIncomingMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket connection closed');
        isConnected = false;
        attemptReconnect();
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnected = false;
        reject(error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      reject(error);
    }
  });
};

// Attempts to reconnect to the WebSocket server
const attemptReconnect = () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Maximum reconnection attempts reached');
    return;
  }
  
  reconnectAttempts++;
  setTimeout(() => {
    console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
    createSocketConnection().catch(() => {
      // Reconnection failed, will retry
    });
  }, RECONNECT_DELAY);
};

// Handles incoming messages and dispatches to registered handlers
const handleIncomingMessage = (message: WebSocketMessage) => {
  const handlers = messageHandlers[message.type] || [];
  handlers.forEach(handler => handler(message.payload));
};

// Sends a message to the WebSocket server
export const sendMessage = (type: WebSocketMessageType, payload: any): boolean => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket not connected');
    return false;
  }
  
  try {
    const message: WebSocketMessage = { type, payload };
    socket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

// Registers a handler for a specific message type
export const addMessageHandler = (type: WebSocketMessageType, handler: MessageHandler): void => {
  messageHandlers[type].push(handler);
};

// Removes a handler for a specific message type
export const removeMessageHandler = (type: WebSocketMessageType, handler: MessageHandler): void => {
  const index = messageHandlers[type].indexOf(handler);
  if (index !== -1) {
    messageHandlers[type].splice(index, 1);
  }
};

// Closes the WebSocket connection
export const closeConnection = (): void => {
  if (socket) {
    socket.close();
    socket = null;
    isConnected = false;
  }
};

// Returns the connection status
export const isSocketConnected = (): boolean => {
  return isConnected;
};
