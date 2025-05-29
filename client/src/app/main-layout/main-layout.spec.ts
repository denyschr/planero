import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Topbar } from '../topbar/topbar';

import MainLayout from './main-layout';

describe(MainLayout.name, () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const fixture = TestBed.createComponent(MainLayout);
    const debugElement = fixture.debugElement;
    fixture.detectChanges();

    return { fixture, debugElement };
  }

  it('should have a topbar', () => {
    const { debugElement } = setup();

    expect(debugElement.query(By.directive(Topbar))).toBeTruthy();
  });

  it('should have a router outlet', () => {
    const { debugElement } = setup();

    expect(debugElement.query(By.directive(RouterOutlet))).toBeTruthy();
  });
});
