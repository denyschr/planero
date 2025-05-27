import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'hero-section',
  templateUrl: './hero-section.html',
  imports: [RouterLink, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSection {}
