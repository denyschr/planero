import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Column } from '../models/column';
import { ColumnTitleForm } from '../column-title-form/column-title-form';
import { TaskForm } from '../task-form/task-form';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../models/task';

@Component({
  selector: 'pln-column-card',
  templateUrl: './column-card.html',
  imports: [ColumnTitleForm, TaskForm, TaskCard],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnCard {
  public readonly column = input.required<Column>();
  public readonly tasks = input.required<Task[], Task[]>({
    transform: (tasks: Task[]) => tasks.filter((task) => task.columnId === this.column().id)
  });
  public readonly createdTask = output<string>();

  protected createTask(title: string): void {
    this.createdTask.emit(title);
  }
}
