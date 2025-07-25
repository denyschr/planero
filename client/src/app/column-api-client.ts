import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

import { Column } from './models/column';
import { Websocket } from './websocket';

@Injectable({
  providedIn: 'root'
})
export class ColumnApiClient {
  private readonly http = inject(HttpClient);
  private readonly websocket = inject(Websocket);

  public list(boardId: string): Observable<Column[]> {
    return this.http.get<Column[]>(`${environment.baseUrl}/api/boards/${boardId}/columns`);
  }

  public create(column: { title: string; boardId: string }): void {
    this.websocket.emit('create-column', column);
  }

  public update(id: string, boardId: string, fields: { title: string }): void {
    this.websocket.emit('update-column', { id, boardId, fields });
  }

  public delete(id: string, boardId: string): void {
    this.websocket.emit('delete-column', { id, boardId });
  }
}
