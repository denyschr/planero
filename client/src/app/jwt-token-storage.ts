import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtTokenStorage {
  public get(): string | null {
    return window.localStorage.getItem('token');
  }

  public save(token: string): void {
    window.localStorage.setItem('token', token);
  }

  public clear(): void {
    window.localStorage.removeItem('token');
  }
}
