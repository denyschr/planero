import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import { environment } from '../environments/environment';

import { User } from './models/user';

@Injectable({
  providedIn: 'root'
})
export class Websocket {
  private socket: Socket | null = null;

  public connect(currentUser: User): void {
    this.socket = io(environment.wsBaseUrl, {
      auth: {
        token: `Bearer ${currentUser.token}`
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
