import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Task } from '../models/task';

@Component({
  selector: 'pln-task-card',
  templateUrl: './task-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCard {
  public readonly task = input.required<Task>();
}
