import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'pln-main-layout',
  templateUrl: './main-layout.html',
  imports: [RouterOutlet, Topbar],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class MainLayout {}
