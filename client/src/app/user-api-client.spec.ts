import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';

import { UserApiClient } from './user-api-client';
import { JwtStorage } from './jwt-storage';
import { User } from './models/user';

describe(UserApiClient.name, () => {
  function setup() {
    const jwtStorageSpy = jasmine.createSpyObj<JwtStorage>('JwtStorage', ['save', 'clear']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: JwtStorage,
          useValue: jwtStorageSpy
        }
      ]
    });
    const httpController = TestBed.inject(HttpTestingController);
    const userApiClient = TestBed.inject(UserApiClient);

    const fakeUser = {
      id: '1',
      username: 'foo',
      email: 'foo@gmail.com',
      token: 'eyJhbGciOiJIUzI1Ni.eyJpZCI6IjY4MmVjM2E5ZD.0rWhF8l0CcwojYv3tWbGRjjRC4'
    };

    return { httpController, userApiClient, jwtStorageSpy, fakeUser };
  }

  describe('get', () => {
    it('should save a user and token on success', () => {
      const { httpController, userApiClient, jwtStorageSpy, fakeUser } = setup();

      let actualUser: User | undefined;
      userApiClient.get().subscribe((fetchedUser) => (actualUser = fetchedUser));

      httpController.expectOne(`${environment.baseUrl}/api/user`).flush(fakeUser);

      expect(actualUser).withContext('You should emit the user').toBe(fakeUser);
      expect(jwtStorageSpy.save).toHaveBeenCalledOnceWith(fakeUser.token);
      expect(userApiClient.currentUser()).toBe(fakeUser);
      httpController.verify();
    });

    it('should clear the user and token on failure', () => {
      const { httpController, userApiClient, jwtStorageSpy } = setup();

      let actualError: HttpErrorResponse | undefined;
      userApiClient.get().subscribe({
        error: (error) => {
          actualError = error;
        }
      });

      const fakeRequest = httpController.expectOne(`${environment.baseUrl}/api/user`);
      fakeRequest.flush('Error', { status: 401, statusText: 'Unauthorized' });

      expect(actualError?.status).toBe(401);
      expect(actualError?.statusText).toBe('Unauthorized');
      expect(jwtStorageSpy.clear).toHaveBeenCalledTimes(1);
      expect(userApiClient.currentUser()).toBeNull();
      httpController.verify();
    });
  });

  it('should log in a user', async () => {
    const { httpController, userApiClient, jwtStorageSpy, fakeUser } = setup();
    const fakeCredentials = {
      email: fakeUser.email,
      password: '12345678'
    };
    const actualUser = firstValueFrom(userApiClient.login(fakeCredentials));

    const fakeRequest = httpController.expectOne({
      method: 'POST',
      url: `${environment.baseUrl}/api/users/login`
    });
    expect(fakeRequest.request.body).toBe(fakeCredentials);
    fakeRequest.flush(fakeUser);

    await expectAsync(actualUser)
      .withContext('You should emit the user')
      .already.toBeResolvedTo(fakeUser);
    expect(jwtStorageSpy.save).toHaveBeenCalledOnceWith(fakeUser.token);
    expect(userApiClient.currentUser()).toBe(fakeUser);
    httpController.verify();
  });

  it('should register a user', () => {
    const { httpController, userApiClient, jwtStorageSpy, fakeUser } = setup();
    const fakeCredentials = {
      username: fakeUser.username,
      email: fakeUser.email,
      password: '12345678'
    };

    let actualUser: User | undefined;
    userApiClient.register(fakeCredentials).subscribe((fetchedUser) => (actualUser = fetchedUser));

    const fakeRequest = httpController.expectOne({
      method: 'POST',
      url: `${environment.baseUrl}/api/users`
    });
    expect(fakeRequest.request.body).toBe(fakeCredentials);
    fakeRequest.flush(fakeUser);

    expect(actualUser).withContext('You should emit the user').toBe(fakeUser);
    expect(jwtStorageSpy.save).toHaveBeenCalledOnceWith(fakeUser.token);
    expect(userApiClient.currentUser()).toBe(fakeUser);
    httpController.verify();
  });

  it('should log out the user', () => {
    const { httpController, userApiClient, jwtStorageSpy, fakeUser } = setup();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');

    let actualUser: User | undefined;
    userApiClient.get().subscribe((fetchedUser) => (actualUser = fetchedUser));

    httpController.expectOne(`${environment.baseUrl}/api/user`).flush(fakeUser);

    expect(actualUser).withContext('You should emit the user').toBe(fakeUser);
    expect(userApiClient.currentUser()).toBe(fakeUser);

    userApiClient.logout();

    expect(jwtStorageSpy.clear).toHaveBeenCalledTimes(1);
    expect(userApiClient.currentUser()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/home');
    httpController.verify();
  });
});
