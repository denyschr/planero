import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

import { Task } from './models/task';
import { Websocket } from './websocket';

@Injectable({
  providedIn: 'root'
})
export class TaskApiClient {
  private readonly http = inject(HttpClient);
  private readonly websocket = inject(Websocket);

  public list(boardId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.baseUrl}/api/boards/${boardId}/tasks`);
  }

  public create(task: { title: string; boardId: string; columnId: string }): void {
    this.websocket.emit('create-task', task);
  }
}
