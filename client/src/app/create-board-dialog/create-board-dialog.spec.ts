import { fakeAsync, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Dialog } from 'primeng/dialog';
import { of, throwError } from 'rxjs';

import { BoardApiClient } from '../board-api-client';
import { Board } from '../models/board';

import { CreateBoardDialog } from './create-board-dialog';

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
    expect(dialogComponent.dismissableMask).withContext('').toBeTrue();
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

    const titleInput = element.querySelector<HTMLInputElement>('input[type=text]')!;
    titleInput.value = 'foo';
    titleInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = element.querySelector<HTMLButtonElement>('button[type=submit]')!;
    button.click();
    fixture.detectChanges();

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

    expect(boardApiClientSpy.create).toHaveBeenCalledOnceWith({
      title: 'foo'
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
