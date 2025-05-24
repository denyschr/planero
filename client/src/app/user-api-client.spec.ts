import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../environments/environment';

import { UserApiClient } from './user-api-client';
import { JwtTokenStorage } from './jwt-token-storage';
import { User } from './models/user';

describe(UserApiClient.name, () => {
  function setup() {
    const jwtTokenStorageSpy = jasmine.createSpyObj<JwtTokenStorage>('JwtTokenStorage', [
      'save',
      'clear'
    ]);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: JwtTokenStorage,
          useValue: jwtTokenStorageSpy
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

    return { jwtTokenStorageSpy, httpController, userApiClient, fakeUser };
  }

  describe('get', () => {
    it('should save a user and token on success', () => {
      const { httpController, userApiClient, jwtTokenStorageSpy, fakeUser } = setup();

      let actualUser: User | undefined;
      userApiClient.get().subscribe((fetchedUser) => (actualUser = fetchedUser));

      httpController.expectOne(`${environment.baseUrl}/api/user`).flush(fakeUser);

      expect(actualUser).withContext('You should emit the user').toBe(fakeUser);
      expect(jwtTokenStorageSpy.save).toHaveBeenCalledOnceWith(fakeUser.token);
      expect(userApiClient.currentUser()).toBe(fakeUser);
      httpController.verify();
    });

    it('should clear the user and token on failure', () => {
      const { httpController, userApiClient, jwtTokenStorageSpy } = setup();

      expect(userApiClient.currentUser()).toBeUndefined();

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
      expect(jwtTokenStorageSpy.clear).toHaveBeenCalledTimes(1);
      expect(userApiClient.currentUser()).toBeNull();
      httpController.verify();
    });
  });

  it('should log in a user', async () => {
    const { httpController, userApiClient, jwtTokenStorageSpy, fakeUser } = setup();
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
    expect(jwtTokenStorageSpy.save).toHaveBeenCalledOnceWith(fakeUser.token);
    expect(userApiClient.currentUser()).toBe(fakeUser);
    httpController.verify();
  });

  it('should register a user', () => {
    const { httpController, userApiClient, jwtTokenStorageSpy, fakeUser } = setup();
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
    expect(jwtTokenStorageSpy.save).toHaveBeenCalledOnceWith(fakeUser.token);
    expect(userApiClient.currentUser()).toBe(fakeUser);
    httpController.verify();
  });
});
