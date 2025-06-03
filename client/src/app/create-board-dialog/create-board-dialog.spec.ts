import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Dialog } from 'primeng/dialog';
import { of, throwError } from 'rxjs';

import { BoardApiClient } from '../board-api-client';
import { Board } from '../models/board';

import { BOARD_BACKGROUNDS, CreateBoardDialog } from './create-board-dialog';

describe(CreateBoardDialog.name, () => {
  function setup() {
    const messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    const boardApiClientSpy = jasmine.createSpyObj<BoardApiClient>('BoardApiClient', ['create']);
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        {
          provide: MessageService,
          useValue: messageServiceSpy
        },
        {
          provide: BoardApiClient,
          useValue: boardApiClientSpy
        }
      ]
    });
    const fixture = TestBed.createComponent(CreateBoardDialog);
    const component = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;
    const debugElement = fixture.debugElement;
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    return { fixture, component, element, debugElement, messageServiceSpy, boardApiClientSpy };
  }

  it('should have a dialog with custom configuration', () => {
    const { debugElement } = setup();
    const dialog = debugElement.query(By.directive(Dialog));
    expect(dialog).toBeTruthy();

    const dialogComponent: Dialog = dialog.componentInstance;
    expect(dialogComponent.header)
      .withContext('The dialog should have a header')
      .toBe('Create board');
    expect(dialogComponent.modal)
      .withContext('The background of the dialog should be blocked')
      .toBeTrue();
    expect(dialogComponent.draggable).withContext('The dialog should NOT be draggable').toBeFalse();
  });

  it('should have a disabled submit button if the form is incomplete', () => {
    const { element } = setup();
    const button = element.querySelector('button[type=submit]')!;
    expect(button).withContext('The template should have a button').toBeTruthy();
    expect(button.hasAttribute('disabled'))
      .withContext('The button should be disabled if the form is invalid')
      .toBeTruthy();
  });

  it('should be possible to create a new board if the form is complete', () => {
    const { fixture, element } = setup();
    const backgroundInputs = element.querySelectorAll<HTMLInputElement>('input[type=radio]');
    expect(backgroundInputs.length)
      .withContext('You should have a radio input for each background')
      .toBe(BOARD_BACKGROUNDS.length);
    backgroundInputs.forEach((backgroundInput, index) => {
      expect(backgroundInput.style.backgroundColor)
        .withContext('You should apply a background color to each radio input')
        .toBe(BOARD_BACKGROUNDS[index]);
    });
    expect(backgroundInputs[0].checked)
      .withContext('You should have the first background selected')
      .toBeTrue();

    const titleInput = element.querySelector<HTMLInputElement>('input[type=text]')!;
    expect(titleInput).withContext('You should have an input for the title').toBeTruthy();
    titleInput.value = 'foo';
    titleInput.dispatchEvent(new Event('input'));
    titleInput.value = '';
    titleInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const titleRequiredError = element.querySelector('#title-required-error')!;
    expect(titleRequiredError)
      .withContext('You should have an error message if the title field is required and dirty')
      .toBeTruthy();
    expect(titleRequiredError.textContent)
      .withContext('The error message for the title field is incorrect')
      .toContain('Board title is required');

    titleInput.value = 'foo';
    titleInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.querySelector('button[type=submit]')!.hasAttribute('disabled')).toBeFalsy();
  });

  it('should call the board api client and emit an event on success', fakeAsync(() => {
    const { fixture, component, element, debugElement, boardApiClientSpy } = setup();
    boardApiClientSpy.create.and.returnValue(of({ id: '1' } as Board));
    spyOn(component.created, 'emit');

    const backgroundInputs = element.querySelectorAll<HTMLInputElement>('input[type=radio]');
    backgroundInputs[1].click();

    const titleInput = element.querySelector<HTMLInputElement>('input[type=text]')!;
    titleInput.value = 'foo';
    titleInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = element.querySelector<HTMLButtonElement>('button[type=submit]')!;
    button.click();
    fixture.detectChanges();

    flush();

    backgroundInputs.forEach((backgroundInput) => {
      expect(backgroundInput.hasAttribute('disabled'))
        .withContext('Your background fields should be disabled when the form is submitted')
        .toBeTruthy();
    });

    expect(titleInput.hasAttribute('disabled'))
      .withContext('Your title field should be disabled when the form is submitted')
      .toBeTruthy();
    expect(button.hasAttribute('disabled'))
      .withContext('Your submit button should be disabled when the form is submitted')
      .toBeTruthy();
    expect(boardApiClientSpy.create).toHaveBeenCalledOnceWith({
      title: 'foo',
      backgroundColor: BOARD_BACKGROUNDS[1]
    });
    expect((debugElement.query(By.directive(Dialog)).componentInstance as Dialog).visible)
      .withContext('The dialog should NOT be visible')
      .toBeFalse();
    expect(component.created.emit).toHaveBeenCalledTimes(1);
  }));

  it('should call the board api client and display a toast message on failure', () => {
    const { fixture, element, debugElement, messageServiceSpy, boardApiClientSpy } = setup();
    boardApiClientSpy.create.and.callFake(() => throwError(() => new Error('error')));

    const titleInput = element.querySelector<HTMLInputElement>('input[type=text]')!;
    titleInput.value = 'foo';
    titleInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = element.querySelector<HTMLButtonElement>('button[type=submit]')!;
    button.click();
    fixture.detectChanges();

    element.querySelectorAll('input[type=radio]').forEach((backgroundInput) => {
      expect(backgroundInput.hasAttribute('disabled'))
        .withContext('Your background fields should NOT be disabled when the form submission fails')
        .toBeFalsy();
    });

    expect(titleInput.hasAttribute('disabled'))
      .withContext('Your title field should NOT be disabled when the form submission fails')
      .toBeFalsy();
    expect(boardApiClientSpy.create).toHaveBeenCalledOnceWith({
      title: 'foo',
      backgroundColor: BOARD_BACKGROUNDS[0]
    });
    expect(messageServiceSpy.add).toHaveBeenCalledOnceWith({
      severity: 'error',
      summary: 'Failed to create new board'
    });
    expect((debugElement.query(By.directive(Dialog)).componentInstance as Dialog).visible)
      .withContext('The dialog should be visible')
      .toBeTrue();
  });
});
