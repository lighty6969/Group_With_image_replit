import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { 
  WebSocketMessage, 
  WebSocketMessageType, 
  Message, 
  RoomUser,
  joinRoomSchema,
  sendMessageSchema
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Define client connection interface
interface ClientConnection extends WebSocket {
  id?: string;
  roomId?: string;
  username?: string;
}

// Map to track socket connections
const clients = new Map<string, ClientConnection>();

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to get available rooms
  app.get('/api/rooms', (req, res) => {
    const rooms = storage.getRooms();
    const roomList = Object.keys(rooms).map(id => ({
      id,
      userCount: rooms[id].users.length
    }));
    res.json(roomList);
  });

  // API route to check if a room exists
  app.get('/api/rooms/:id', (req, res) => {
    const roomId = req.params.id;
    const room = storage.getRoom(roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({
      id: room.id,
      userCount: room.users.length,
      createdAt: room.createdAt
    });
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: ClientConnection) => {
    const clientId = uuidv4();
    ws.id = clientId;
    clients.set(clientId, ws);

    console.log(`Client connected: ${clientId}`);

    // Handle incoming messages
    ws.on('message', (data: string) => {
      try {
        const message: WebSocketMessage = JSON.parse(data);
        handleMessage(ws, message);
      } catch (error) {
        sendErrorToClient(ws, 'Invalid message format');
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      if (ws.roomId) {
        const { room, removedUser } = storage.removeUserFromRoom(ws.roomId, clientId);
        
        if (room && removedUser) {
          // Notify other users that a user has left
          broadcastToRoom(ws.roomId, {
            type: WebSocketMessageType.USER_LEFT,
            payload: {
              username: removedUser.username,
              timestamp: new Date()
            }
          }, ws.id);

          // Send updated user list
          broadcastToRoom(ws.roomId, {
            type: WebSocketMessageType.ROOM_USERS,
            payload: {
              users: room.users
            }
          });
        }
      }
      
      // Remove client from the clients map
      clients.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    });

    // Send initial connection confirmation
    sendToClient(ws, {
      type: WebSocketMessageType.ERROR,
      payload: {
        message: 'Connected to server',
        status: 'success'
      }
    });
  });

  // Run cleanup every 10 minutes to remove any empty rooms
  setInterval(() => {
    storage.cleanupEmptyRooms();
  }, 10 * 60 * 1000);

  return httpServer;
}

// Handle different message types
function handleMessage(ws: ClientConnection, message: WebSocketMessage): void {
  switch (message.type) {
    case WebSocketMessageType.JOIN_ROOM:
      handleJoinRoom(ws, message.payload);
      break;
    case WebSocketMessageType.SEND_MESSAGE:
      handleSendMessage(ws, message.payload);
      break;
    default:
      sendErrorToClient(ws, 'Unknown message type');
  }
}

// Handle user joining a room
function handleJoinRoom(ws: ClientConnection, payload: any): void {
  try {
    // Validate join room payload
    const { roomId, username } = joinRoomSchema.parse(payload);
    
    // Generate a username if not provided
    const finalUsername = username || generateUsername();
    
    // Create or get the room
    let room = storage.getRoom(roomId);
    
    if (!room) {
      room = storage.createRoom(roomId);
    }
    
    // Add user to the room
    const user: RoomUser = {
      id: uuidv4(),
      username: finalUsername,
      socketId: ws.id!,
      joinedAt: new Date()
    };
    
    // Update room with the new user
    room = storage.addUserToRoom(roomId, user)!;
    
    // Update ws object with room and username
    ws.roomId = roomId;
    ws.username = finalUsername;
    
    // Send join success to the client
    sendToClient(ws, {
      type: WebSocketMessageType.JOIN_ROOM,
      payload: {
        success: true,
        roomId: roomId,
        username: finalUsername,
        createdAt: room.createdAt,
        messages: room.messages
      }
    });
    
    // Create system message for user joining
    const joinMessage: Omit<Message, 'id'> = {
      roomId,
      username: 'System',
      content: `${finalUsername} joined the room`,
      timestamp: new Date(),
      isSystem: true
    };
    
    // Add message to room
    storage.addMessageToRoom(roomId, joinMessage);
    
    // Notify other users in the room that a new user has joined
    broadcastToRoom(roomId, {
      type: WebSocketMessageType.USER_JOINED,
      payload: {
        user,
        message: joinMessage
      }
    }, ws.id);
    
    // Send updated user list to all users in the room
    broadcastToRoom(roomId, {
      type: WebSocketMessageType.ROOM_USERS,
      payload: {
        users: room.users
      }
    });
    
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      sendErrorToClient(ws, validationError.message);
    } else {
      sendErrorToClient(ws, 'Failed to join room');
    }
  }
}

// Handle sending a message to a room
function handleSendMessage(ws: ClientConnection, payload: any): void {
  try {
    // Validate send message payload
    const { roomId, content } = sendMessageSchema.parse(payload);
    
    // Check if client is in the room they're trying to send a message to
    if (ws.roomId !== roomId) {
      return sendErrorToClient(ws, 'You are not in this room');
    }
    
    // Create the message
    const message: Omit<Message, 'id'> = {
      roomId,
      username: ws.username!,
      content,
      timestamp: new Date(),
      isSystem: false
    };
    
    // Add message to the room
    const newMessage = storage.addMessageToRoom(roomId, message);
    
    if (!newMessage) {
      return sendErrorToClient(ws, 'Room not found');
    }
    
    // Broadcast the message to all clients in the room
    broadcastToRoom(roomId, {
      type: WebSocketMessageType.NEW_MESSAGE,
      payload: newMessage
    });
    
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      sendErrorToClient(ws, validationError.message);
    } else {
      sendErrorToClient(ws, 'Failed to send message');
    }
  }
}

// Send a message to a specific client
function sendToClient(client: ClientConnection, message: WebSocketMessage): void {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}

// Send an error message to a client
function sendErrorToClient(client: ClientConnection, errorMessage: string): void {
  sendToClient(client, {
    type: WebSocketMessageType.ERROR,
    payload: {
      message: errorMessage,
      status: 'error'
    }
  });
}

// Broadcast a message to all clients in a room
function broadcastToRoom(roomId: string, message: WebSocketMessage, excludeClientId?: string): void {
  const room = storage.getRoom(roomId);
  if (!room) return;
  
  for (const user of room.users) {
    if (excludeClientId && user.socketId === excludeClientId) continue;
    
    const client = clients.get(user.socketId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

// Generate a random username (fallback function)
function generateUsername(): string {
  const adjectives = ['Happy', 'Clever', 'Brave', 'Quiet', 'Friendly', 'Curious', 'Jolly', 'Silly'];
  const nouns = ['Tiger', 'Penguin', 'Giraffe', 'Koala', 'Dolphin', 'Fox', 'Elephant', 'Bee'];
  
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 100);
  
  return `${randomAdj}${randomNoun}${randomNumber}`;
}
