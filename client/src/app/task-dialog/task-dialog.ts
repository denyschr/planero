import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  Signal,
  signal
} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BoardState } from '../board-state';
import { Column } from '../models/column';
import { Task } from '../models/task';
import { TaskApiClient } from '../task-api-client';
import { Websocket } from '../websocket';

type ViewModel = {
  task: Task | undefined;
  columns: Column[];
};

@Component({
  selector: 'pln-task-dialog',
  templateUrl: './task-dialog.html',
  imports: [
    Dialog,
    Button,
    Select,
    FormsModule,
    ReactiveFormsModule,
    Textarea,
    Message,
    ProgressSpinner
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDialog {
  private readonly router = inject(Router);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly boardState = inject(BoardState);
  private readonly taskApiClient = inject(TaskApiClient);
  private readonly websocket = inject(Websocket);

  protected readonly visible = signal(true);
  protected readonly titleControl = this.formBuilder.control('', [Validators.required]);
  protected readonly descriptionControl = this.formBuilder.control('');
  protected readonly form = this.formBuilder.group({
    title: this.titleControl,
    description: this.descriptionControl
  });

  protected readonly id: string;
  protected readonly boardId: string;
  protected readonly vm: Signal<ViewModel | undefined>;

  protected readonly selectedColumn = linkedSignal(() => {
    const vm = this.vm();
    return vm?.columns.find((column) => column.id === vm?.task?.columnId);
  });

  constructor() {
    const route = inject(ActivatedRoute);

    this.id = route.snapshot.paramMap.get('id')!;
    this.boardId = route.parent!.snapshot.paramMap.get('id')!;

    this.vm = computed(() => ({
      task: this.boardState.tasks().find((task) => task.id === this.id),
      columns: this.boardState.columns()
    }));

    effect(() => {
      const vm = this.vm();
      const task = vm?.task;

      if (vm?.columns.length && task == null) {
        return void this.router.navigateByUrl('/boards');
      }

      if (task) {
        this.form.patchValue({
          title: task.title,
          description: task.description ?? ''
        });
      }
    });

    this.websocket
      .listen<string>('delete-task-success')
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.redirectToBoard();
      });
  }

  protected changeColumn(column: Column): void {
    this.taskApiClient.update(this.id, this.boardId, { columnId: column.id });
  }

  protected update(): void {
    const { title, description } = this.form.getRawValue();
    const task = this.vm()?.task;
    if (task?.title !== title || task?.description !== description) {
      this.taskApiClient.update(this.id, this.boardId, { title, description });
      this.redirectToBoard();
    }
  }

  protected delete(): void {
    this.taskApiClient.delete(this.id, this.boardId);
  }

  protected redirectToBoard(): void {
    this.router.navigate(['/boards', this.boardId]);
  }
}
