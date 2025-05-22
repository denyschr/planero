import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';

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
      const { jwtTokenStorageSpy, httpController, userApiClient, fakeUser } = setup();

      expect(userApiClient.currentUser()).toBeUndefined();

      let actualUser: User | undefined;
      userApiClient.get().subscribe((fetchedUser) => (actualUser = fetchedUser));

      httpController.expectOne(`${environment.baseUrl}/api/user`).flush(fakeUser);

      expect(actualUser).toBe(fakeUser);
      expect(jwtTokenStorageSpy.save).toHaveBeenCalledWith(fakeUser.token);
      expect(userApiClient.currentUser()).toBe(fakeUser);
      httpController.verify();
    });

    it('should clear the user and token on failure', () => {
      const { jwtTokenStorageSpy, httpController, userApiClient } = setup();

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
      expect(jwtTokenStorageSpy.clear).toHaveBeenCalled();
      expect(userApiClient.currentUser()).toBeNull();
      httpController.verify();
    });
  });
});
