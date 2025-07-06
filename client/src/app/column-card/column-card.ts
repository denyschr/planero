import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Column } from '../models/column';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../models/task';
import { ColumnOptions } from '../column-options/column-options';
import { InplaceTextarea } from '../inplace-textarea/inplace-textarea';
import { InplaceForm } from '../inplace-form/inplace-form';

@Component({
  selector: 'pln-column-card',
  templateUrl: './column-card.html',
  imports: [TaskCard, ColumnOptions, InplaceTextarea, InplaceForm],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnCard {
  public readonly column = input.required<Column>();
  public readonly tasks = input.required<Task[]>();
  public readonly titleChanged = output<string>();
  public readonly columnDeleted = output<void>();
  public readonly taskCreated = output<string>();

  protected readonly filteredTasks = computed(() =>
    this.tasks().filter((task) => task.columnId === this.column().id)
  );
}
