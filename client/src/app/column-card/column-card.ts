import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';

import { Column } from '../models/column';
import { TaskCard } from '../task-card/task-card';
import { Task, TaskReorderUpdate } from '../models/task';
import { ColumnOptions } from '../column-options/column-options';
import { InplaceTextarea } from '../inplace-textarea/inplace-textarea';
import { InplaceForm } from '../inplace-form/inplace-form';

@Component({
  selector: 'pln-column-card',
  templateUrl: './column-card.html',
  imports: [TaskCard, ColumnOptions, InplaceTextarea, InplaceForm, CdkDrag, CdkDropList],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnCard {
  public readonly column = input.required<Column>();
  public readonly tasks = input.required<Task[]>();
  public readonly titleChanged = output<string>();
  public readonly columnDeleted = output<void>();
  public readonly taskCreated = output<string>();
  public readonly taskReordered = output<TaskReorderUpdate[]>();

  protected readonly filteredTasks = computed(() =>
    this.tasks().filter((task) => task.columnId === this.column().id)
  );

  protected dropTask(event: CdkDragDrop<Task[]>): void {
    const sourceColumnId = event.previousContainer.data[0].columnId;
    const targetColumnId = this.column().id;

    if (event.previousContainer === event.container) {
      const tasks = [...this.filteredTasks()];
      moveItemInArray(tasks, event.previousIndex, event.currentIndex);

      const updates = tasks.map((task, index) => ({
        id: task.id,
        columnId: targetColumnId,
        order: index
      }));

      this.taskReordered.emit(updates);
    } else {
      const sourceTasks = [...event.previousContainer.data];
      const targetTasks = [...this.filteredTasks()];

      transferArrayItem(sourceTasks, targetTasks, event.previousIndex, event.currentIndex);

      const updates = [
        ...sourceTasks.map((task, index) => ({
          id: task.id,
          columnId: sourceColumnId,
          order: index
        })),
        ...targetTasks.map((task, index) => ({
          id: task.id,
          columnId: targetColumnId,
          order: index
        }))
      ];

      this.taskReordered.emit(updates);
    }
  }
}
