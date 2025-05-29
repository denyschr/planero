import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pln-boards',
  templateUrl: './boards.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Boards {}
