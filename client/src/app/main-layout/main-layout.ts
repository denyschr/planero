import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'pln-main-layout',
  templateUrl: './main-layout.html',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class MainLayout {}
