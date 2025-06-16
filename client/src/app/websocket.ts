import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

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

  public emit(eventName: string, message: unknown): void {
    if (this.socket) {
      this.socket.emit(eventName, message);
    }
  }

  public listen<T>(eventName: string): Observable<T> {
    return new Observable<T>((observer) => {
      if (!this.socket) {
        return void observer.error('Socket is not established');
      }
      this.socket.on(eventName, (data) => {
        observer.next(data);
      });
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
