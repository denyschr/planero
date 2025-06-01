import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';

import { BoardApiClient } from './board-api-client';
import { Board } from './models/board';

describe(BoardApiClient.name, () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const httpController = TestBed.inject(HttpTestingController);
    const boardApiClient = TestBed.inject(BoardApiClient);

    return { httpController, boardApiClient };
  }

  it('should list boards', () => {
    const { httpController, boardApiClient } = setup();
    const fakeBoards = [{ title: 'Foo' }, { title: 'Bar' }] as Board[];

    let actualBoards: Board[] = [];
    boardApiClient.list().subscribe((fetchedBoards) => (actualBoards = fetchedBoards));

    httpController.expectOne(`${environment.baseUrl}/api/boards`).flush(fakeBoards);

    expect(actualBoards.length).withContext('You should emit a list of boards').not.toBe(0);
    expect(actualBoards).toEqual(fakeBoards);
    httpController.verify();
  });
});
