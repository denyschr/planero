import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';

import { User } from './models/user';
import { JwtStorage } from './jwt-storage';
import { Websocket } from './websocket';

@Injectable({
  providedIn: 'root'
})
export class UserApiClient {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly jwtStorage = inject(JwtStorage);
  private readonly websocket = inject(Websocket);
  private readonly user = signal<User | null>(null);

  public readonly currentUser = this.user.asReadonly();

  public get(): Observable<User> {
    return this.http.get<User>(`${environment.baseUrl}/api/user`).pipe(
      tap({
        next: (user) => this.save(user),
        error: () => this.clear()
      })
    );
  }

  public login(credentials: { email: string; password: string }): Observable<User> {
    return this.http
      .post<User>(`${environment.baseUrl}/api/users/login`, credentials)
      .pipe(tap((user) => this.save(user)));
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

  public logout(): void {
    this.clear();
    this.websocket.disconnect();
    this.router.navigateByUrl('/home');
  }

  private save(user: User): void {
    this.jwtStorage.save(user.token);
    this.user.set(user);
    this.websocket.connect(user);
  }

  private clear(): void {
    this.jwtStorage.clear();
    this.user.set(null);
  }
}
