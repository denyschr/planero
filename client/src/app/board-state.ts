import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BoardApiClient } from './board-api-client';
import { ColumnApiClient } from './column-api-client';
import { TaskApiClient } from './task-api-client';
import { Board } from './models/board';
import { Column } from './models/column';
import { Task } from './models/task';

export type BoardStateData = {
  board: Board | null;
  columns: Column[];
  tasks: Task[];
  loaded: boolean;
};

@Injectable()
export class BoardState {
  private readonly boardApiClient = inject(BoardApiClient);
  private readonly columnApiClient = inject(ColumnApiClient);
  private readonly taskApiClient = inject(TaskApiClient);

  private readonly state = signal<BoardStateData>({
    board: null,
    columns: [],
    tasks: [],
    loaded: false
  });

  public readonly board = computed(() => this.state().board);
  public readonly columns = computed(() => this.state().columns);
  public readonly tasks = computed(() => this.state().tasks);
  public readonly loaded = computed(() => this.state().loaded);

  public readonly idSubject = new Subject<string>();

  constructor() {
    this.idSubject
      .pipe(
        switchMap((id) =>
          forkJoin({
            board: this.boardApiClient.get(id),
            columns: this.columnApiClient.list(id),
            tasks: this.taskApiClient.list(id)
          })
        ),
        takeUntilDestroyed()
      )
      .subscribe(({ board, columns, tasks }) => {
        this.state.update((state) => ({
          ...state,
          board,
          columns,
          tasks,
          loaded: true
        }));
      });
  }

  public setColumns(columns: Column[]): void {
    this.state.update((state) => ({ ...state, columns }));
  }

  public setTasks(tasks: Task[]): void {
    this.state.update((state) => ({ ...state, tasks }));
  }

  public updateBoard(update: Board): void {
    this.state.update((state) => ({ ...state, board: { ...state.board, ...update } }));
  }

  public addColumn(column: Column): void {
    this.state.update((state) => ({
      ...state,
      columns: [...state.columns, column]
    }));
  }

  public updateColumn(update: Column): void {
    this.state.update((state) => ({
      ...state,
      columns: state.columns.map((column) =>
        column.id === update.id ? { ...column, ...update } : column
      )
    }));
  }

  public deleteColumn(id: string): void {
    this.state.update((state) => ({
      ...state,
      columns: state.columns.filter((column) => column.id !== id)
    }));
  }

  public addTask(task: Task): void {
    this.state.update((state) => ({
      ...state,
      tasks: [...state.tasks, task]
    }));
  }

  public updateTask(update: Task): void {
    this.state.update((state) => ({
      ...state,
      tasks: state.tasks.map((task) => (task.id === update.id ? { ...task, ...update } : task))
    }));
  }

  public deleteTask(id: string): void {
    this.state.update((state) => ({
      ...state,
      tasks: state.tasks.filter((task) => task.id !== id)
    }));
  }
}
