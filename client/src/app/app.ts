import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
  selector: 'pln-root',
  imports: [RouterOutlet],
  templateUrl: './app.html'
})
export class App {}
