import { Server } from 'socket.io';
import { NextApiResponse } from 'next';
import { NextApiRequestWithSocket } from './types';

export default function handler(req: NextApiRequestWithSocket, res: NextApiResponse) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server as any, {
      path: '/api/socketio',
    });

    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log('A user connected');

      socket.on('message', msg => {
        socket.broadcast.emit('message', msg);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  }
  res.end();
}
