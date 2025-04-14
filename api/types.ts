import { Socket } from 'net';
import { NextApiRequest } from 'next';

export interface NextApiRequestWithSocket extends NextApiRequest {
  socket: Socket & {
    server: {
      io?: any;
    };
  };
}
