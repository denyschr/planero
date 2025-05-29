import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HeroSection } from './hero-section/hero-section';
import { Topbar } from './topbar/topbar';

@Component({
  selector: 'pln-landing',
  templateUrl: './landing.html',
  imports: [HeroSection, Topbar],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Landing {}
