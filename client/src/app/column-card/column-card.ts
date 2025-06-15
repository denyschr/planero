import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Column } from '../models/column';
import { ColumnTitleForm } from '../column-title-form/column-title-form';

@Component({
  selector: 'pln-column-card',
  templateUrl: './column-card.html',
  imports: [ColumnTitleForm],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnCard {
  public readonly column = input.required<Column>();
}
