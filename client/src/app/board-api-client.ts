import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

import { Board } from './models/board';

@Injectable({
  providedIn: 'root'
})
export class BoardApiClient {
  private readonly http = inject(HttpClient);

  public list(): Observable<Board[]> {
    return this.http.get<Board[]>(`${environment.baseUrl}/api/boards`);
  }

  public create(board: { title: string; backgroundColor: string }): Observable<Board> {
    return this.http.post<Board>(`${environment.baseUrl}/api/boards`, board);
  }
}
