import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { BoardApiClient } from '../board-api-client';
import { Board } from '../models/board';
import { CreateBoardDialog } from '../create-board-dialog/create-board-dialog';

import { Boards } from './boards';

describe(Boards.name, () => {
  function setup() {
    const fakeBoards = [
      { id: '1', title: 'Foo' },
      { id: '2', title: 'Bar' }
    ] as Board[];
    const boardApiClientSpy = jasmine.createSpyObj<BoardApiClient>('BoardApiClient', ['list']);
    boardApiClientSpy.list.and.returnValue(of(fakeBoards));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        MessageService,
        {
          provide: BoardApiClient,
          useValue: boardApiClientSpy
        }
      ]
    });
    const fixture = TestBed.createComponent(Boards);
    const component = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;
    const debugElement = fixture.debugElement;
    fixture.detectChanges();

    return { fixture, component, element, debugElement, boardApiClientSpy, fakeBoards };
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
    expect(boards[0].textContent)
      .withContext('The board should have a text')
      .toContain(fakeBoards[0].title);
  });

  it('should display a button to create a new board', () => {
    const { fixture, element, debugElement } = setup();
    const button = element.querySelector<HTMLButtonElement>('button#create-board-button')!;
    expect(button).withContext('You should have a `button` element to create a board').toBeTruthy();
    expect(button.textContent)
      .withContext('The button should have a text')
      .toContain('Create new board');

    const dialog = debugElement.query(By.directive(CreateBoardDialog));
    expect(dialog).withContext('You should have a dialog to create a board').toBeTruthy();
    const dialogComponent: CreateBoardDialog = dialog.componentInstance;
    expect(dialogComponent.visible())
      .withContext('The dialog should NOT be visible by default')
      .toBeFalse();

    button.click();
    fixture.detectChanges();

    expect(dialogComponent.visible())
      .withContext('The dialog should be visible after click')
      .toBeTrue();
  });

  it('should emit an event when a board is created', () => {
    const { component, debugElement } = setup();
    spyOn(component.refreshSubject, 'next');

    const dialogComponent: CreateBoardDialog = debugElement.query(
      By.directive(CreateBoardDialog)
    ).componentInstance;
    dialogComponent.created.emit();

    expect(component.refreshSubject.next).toHaveBeenCalledTimes(1);
  });
});
