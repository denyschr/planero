import { Socket } from 'socket.io';

import { UserDocument } from './user';

export type SocketRequest = Socket & {
  currentUser?: UserDocument;
};
