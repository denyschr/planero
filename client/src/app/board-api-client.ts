import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

import { Board } from './models/board';
import { Websocket } from './websocket';

@Injectable({
  providedIn: 'root'
})
export class BoardApiClient {
  private readonly http = inject(HttpClient);
  private readonly websocket = inject(Websocket);

  public list(): Observable<Board[]> {
    return this.http.get<Board[]>(`${environment.baseUrl}/api/boards`);
  }

  public get(id: string): Observable<Board> {
    return this.http.get<Board>(`${environment.baseUrl}/api/boards/${id}`);
  }

  public create(board: { title: string }): Observable<Board> {
    return this.http.post<Board>(`${environment.baseUrl}/api/boards`, board);
  }

  public update(id: string, fields: { title: string }): void {
    this.websocket.emit('update-board', { id, fields });
  }

  public delete(id: string): void {
    this.websocket.emit('delete-board', { id });
  }

  public join(id: string): void {
    this.websocket.emit('join-board', { id });
  }

  public leave(id: string): void {
    this.websocket.emit('leave-board', { id });
  }
}
