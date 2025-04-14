import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Message type definitions
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  SYSTEM = 'system'
}

export type Message = {
  id: string;
  roomId: string;
  username: string;
  content: string;
  timestamp: Date;
  type: MessageType;
  isSystem: boolean;
  imageUrl?: string;
};

// Room type definitions
export type Room = {
  id: string;
  users: RoomUser[];
  messages: Message[];
  createdAt: Date;
};

export type RoomUser = {
  id: string;
  username: string;
  socketId: string;
  joinedAt: Date;
};

// WebSocket message types
export type WebSocketMessage = {
  type: WebSocketMessageType;
  payload: any;
};

export enum WebSocketMessageType {
  JOIN_ROOM = 'JOIN_ROOM',
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  SEND_MESSAGE = 'SEND_MESSAGE',
  NEW_MESSAGE = 'NEW_MESSAGE',
  ROOM_USERS = 'ROOM_USERS',
  ERROR = 'ERROR'
}

// Client to server message schemas
export const joinRoomSchema = z.object({
  roomId: z.string().min(1),
  username: z.string().optional()
});

export const sendMessageSchema = z.object({
  roomId: z.string().min(1),
  content: z.string().min(1),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
  imageUrl: z.string().optional()
});

export type JoinRoomPayload = z.infer<typeof joinRoomSchema>;
export type SendMessagePayload = z.infer<typeof sendMessageSchema>;
