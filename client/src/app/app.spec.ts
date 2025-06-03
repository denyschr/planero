import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';

import { App } from './app';

describe(App.name, () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [MessageService]
    });
    const fixture = TestBed.createComponent(App);
    const debugElement = fixture.debugElement;
    fixture.detectChanges();

    return { fixture, debugElement };
  }

  it('should have a router outlet', () => {
    const { debugElement } = setup();

    expect(debugElement.query(By.directive(RouterOutlet))).toBeTruthy();
  });
});
