import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

import { App } from './app';

describe(App.name, () => {
  function setup() {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    return { fixture };
  }

  it('should have a router outlet', () => {
    const { fixture } = setup();

    expect(fixture.debugElement.query(By.directive(RouterOutlet))).toBeTruthy();
  });
});
