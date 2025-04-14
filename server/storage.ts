import { Room, RoomUser, Message } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

// Interface for storage operations
export interface IStorage {
  createRoom(roomId: string): Room;
  getRoom(roomId: string): Room | undefined;
  addUserToRoom(roomId: string, user: RoomUser): Room | undefined;
  removeUserFromRoom(roomId: string, socketId: string): { room: Room | undefined, removedUser: RoomUser | undefined };
  addMessageToRoom(roomId: string, message: Omit<Message, 'id'>): Message | undefined;
  cleanupEmptyRooms(): void;
  getRooms(): Record<string, Room>;
}

export class MemStorage implements IStorage {
  private rooms: Record<string, Room>;

  constructor() {
    this.rooms = {};
  }

  createRoom(roomId: string): Room {
    if (this.rooms[roomId]) {
      return this.rooms[roomId];
    }

    const room: Room = {
      id: roomId,
      users: [],
      messages: [],
      createdAt: new Date()
    };

    this.rooms[roomId] = room;
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms[roomId];
  }

  addUserToRoom(roomId: string, user: RoomUser): Room | undefined {
    const room = this.rooms[roomId];
    if (!room) return undefined;

    // Check if user with same username already exists in room
    const existingUserIdx = room.users.findIndex(u => u.username === user.username);
    if (existingUserIdx >= 0) {
      // Update the existing user's socketId
      room.users[existingUserIdx].socketId = user.socketId;
    } else {
      room.users.push(user);
    }

    return room;
  }

  removeUserFromRoom(roomId: string, socketId: string): { room: Room | undefined, removedUser: RoomUser | undefined } {
    const room = this.rooms[roomId];
    if (!room) return { room: undefined, removedUser: undefined };

    const userIndex = room.users.findIndex(user => user.socketId === socketId);
    if (userIndex === -1) return { room, removedUser: undefined };

    const removedUser = room.users[userIndex];
    room.users.splice(userIndex, 1);

    // Clean up empty rooms
    if (room.users.length === 0) {
      delete this.rooms[roomId];
      return { room: undefined, removedUser };
    }

    return { room, removedUser };
  }

  addMessageToRoom(roomId: string, message: Omit<Message, 'id'>): Message | undefined {
    const room = this.rooms[roomId];
    if (!room) return undefined;

    const newMessage: Message = {
      id: uuidv4(),
      ...message
    };

    room.messages.push(newMessage);
    return newMessage;
  }

  cleanupEmptyRooms(): void {
    for (const roomId in this.rooms) {
      if (this.rooms[roomId].users.length === 0) {
        delete this.rooms[roomId];
      }
    }
  }

  getRooms(): Record<string, Room> {
    return this.rooms;
  }
}

export const storage = new MemStorage();
