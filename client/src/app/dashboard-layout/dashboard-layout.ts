import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'pln-dashboard-layout',
  templateUrl: './dashboard-layout.html',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class DashboardLayout {}
