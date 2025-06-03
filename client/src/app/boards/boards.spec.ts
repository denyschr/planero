import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';

import { BoardApiClient } from '../board-api-client';
import { Board } from '../models/board';

import Boards from './boards';

describe(Boards.name, () => {
  function setup() {
    const fakeBoards = [
      { id: '1', title: 'Foo', backgroundColor: 'red' },
      { id: '2', title: 'Bar', backgroundColor: 'blue' }
    ] as Board[];
    const boardApiClientSpy = jasmine.createSpyObj<BoardApiClient>('BoardApiClient', ['list']);
    boardApiClientSpy.list.and.returnValue(of(fakeBoards));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        MessageService,
        {
          provide: BoardApiClient,
          useValue: boardApiClientSpy
        }
      ]
    });
    const fixture = TestBed.createComponent(Boards);
    const element: HTMLElement = fixture.nativeElement;
    fixture.detectChanges();

    return { fixture, element, boardApiClientSpy, fakeBoards };
  }

  it('should have a title', () => {
    const { element } = setup();
    const title = element.querySelector('h2')!;

    expect(title).withContext('You should have an `h2` element to display the title').toBeTruthy();
    expect(title.textContent).withContext('The title should have a text').toContain('My Boards');
  });

  it('should display a list of boards', () => {
    const { element, fakeBoards } = setup();
    const boards = element.querySelectorAll('a');

    expect(boards.length).withContext('You should have 2 boards displayed').toBe(2);
    expect(boards[0].href)
      .withContext('The `href` attribute of the board is incorrect')
      .toContain(`/boards/${fakeBoards[0].id}`);
    expect(boards[0].style.backgroundColor)
      .withContext('The board should have a background color')
      .toBe(fakeBoards[0].backgroundColor);
    expect(boards[0].textContent)
      .withContext('The board should have a text')
      .toContain(fakeBoards[0].title);
  });
});
