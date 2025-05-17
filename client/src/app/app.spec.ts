import { TestBed } from '@angular/core/testing';

import { App } from './app';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'planero' title`, () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('planero');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, planero');
  });
});
