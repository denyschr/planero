import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../environments/environment';

import { User } from './models/user';
import { JwtTokenStorage } from './jwt-token-storage';

@Injectable({
  providedIn: 'root'
})
export class UserApiClient {
  private readonly http = inject(HttpClient);
  private readonly jwtTokenStorage = inject(JwtTokenStorage);
  private readonly user = signal<User | null | undefined>(undefined);
  public readonly currentUser = this.user.asReadonly();

  public get(): Observable<User> {
    return this.http.get<User>(`${environment.baseUrl}/api/user`).pipe(
      tap({
        next: (user) => this.save(user),
        error: () => this.clear()
      })
    );
  }

  public register(credentials: {
    username: string;
    email: string;
    password: string;
  }): Observable<User> {
    return this.http
      .post<User>(`${environment.baseUrl}/api/users`, credentials)
      .pipe(tap((user) => this.save(user)));
  }

  private save(user: User): void {
    this.jwtTokenStorage.save(user.token);
    this.user.set(user);
  }

  private clear(): void {
    this.jwtTokenStorage.clear();
    this.user.set(null);
  }
}
