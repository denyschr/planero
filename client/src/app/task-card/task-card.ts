import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Task } from '../models/task';

@Component({
  selector: 'pln-task-card',
  templateUrl: './task-card.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCard {
  public readonly task = input.required<Task>();
}
