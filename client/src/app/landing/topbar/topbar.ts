import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'topbar',
  templateUrl: './topbar.html',
  imports: [RouterLink, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Topbar {}
