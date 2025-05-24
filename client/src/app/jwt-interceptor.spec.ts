import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { jwtInterceptor } from './jwt-interceptor';
import { JwtTokenStorage } from './jwt-token-storage';

describe(jwtInterceptor.name, () => {
  function setup() {
    const jwtTokenStorageSpy = jasmine.createSpyObj<JwtTokenStorage>('JwtTokenStorage', ['get']);
    jwtTokenStorageSpy.get.and.returnValue(null);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        {
          provide: JwtTokenStorage,
          useValue: jwtTokenStorageSpy
        }
      ]
    });
    const http = TestBed.inject(HttpClient);
    const httpController = TestBed.inject(HttpTestingController);

    return { http, httpController, jwtTokenStorageSpy };
  }

  it('should do nothing if there is no token', () => {
    const { http, httpController } = setup();

    http.get('/foo').subscribe();

    const fakeRequest = httpController.expectOne('/foo');
    expect(fakeRequest.request.headers.get('Authorization')).toBeNull();

    httpController.verify();
  });

  it('should send a token', () => {
    const { http, httpController, jwtTokenStorageSpy } = setup();
    jwtTokenStorageSpy.get.and.returnValue('token');

    http.get('/foo').subscribe();

    const fakeRequest = httpController.expectOne('/foo');
    expect(fakeRequest.request.headers.get('Authorization')).toBe('Bearer token');

    httpController.verify();
  });
});
