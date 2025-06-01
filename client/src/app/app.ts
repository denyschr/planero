import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
  selector: 'pln-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html'
})
export class App {}
