import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, scan, startWith, Subject, switchMap, tap } from 'rxjs';

import { Board as BoardType } from '../models/board';
import { BoardApiClient } from '../board-api-client';
import { BoardTitleForm } from '../board-title-form/board-title-form';
import { ColumnApiClient } from '../column-api-client';
import { Column } from '../models/column';
import { ColumnForm } from '../column-form/column-form';
import { ColumnCard } from '../column-card/column-card';
import { Websocket } from '../websocket';
import { TaskApiClient } from '../task-api-client';
import { Task } from '../models/task';
import { BoardOptions } from '../board-options/board-options';

type ViewModel = {
  board: BoardType;
  columns: Column[];
  tasks: Task[];
};

type BoardAction = { type: 'update'; board: BoardType };
type ColumnAction = { type: 'create'; column: Column } | { type: 'delete'; id: string };
type TaskAction = { type: 'create'; task: Task };

@Component({
  selector: 'pln-board',
  templateUrl: './board.html',
  imports: [BoardTitleForm, ColumnForm, ColumnCard, BoardOptions],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Board {
  private readonly boardApiClient = inject(BoardApiClient);
  private readonly columnApiClient = inject(ColumnApiClient);
  private readonly taskApiClient = inject(TaskApiClient);
  private readonly websocket = inject(Websocket);

  private readonly boardActions$ = new Subject<BoardAction>();
  private readonly columnActions$ = new Subject<ColumnAction>();
  private readonly taskActions$ = new Subject<TaskAction>();

  protected readonly id: string;
  protected readonly vm: Signal<ViewModel | undefined>;

  constructor() {
    const router = inject(Router);
    const route = inject(ActivatedRoute);

    this.id = route.snapshot.paramMap.get('id')!;
    this.boardApiClient.join(this.id);

    const board$ = this.boardApiClient.get(this.id).pipe(
      switchMap((initialBoard) =>
        this.boardActions$.pipe(
          map((action) => action.board),
          startWith(initialBoard)
        )
      )
    );

    const columns$ = this.columnApiClient.list(this.id).pipe(
      switchMap((initialColumns) =>
        this.columnActions$.pipe(
          scan((columns, action) => {
            if (action.type === 'create') {
              return [...columns, action.column];
            } else {
              return columns.filter((column) => column.id !== action.id);
            }
          }, initialColumns),
          startWith(initialColumns)
        )
      )
    );

    const tasks$ = this.taskApiClient.list(this.id).pipe(
      switchMap((initialTasks) =>
        this.taskActions$.pipe(
          scan((tasks, action) => [...tasks, action.task], initialTasks),
          startWith(initialTasks)
        )
      )
    );

    router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        tap(() => {
          this.boardApiClient.leave(this.id);
        })
      )
      .subscribe();

    this.websocket
      .listen<BoardType>('update-board-success')
      .pipe(takeUntilDestroyed())
      .subscribe((board) => {
        this.boardActions$.next({ type: 'update', board });
      });

    this.websocket
      .listen<void>('delete-board-success')
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        router.navigateByUrl('/boards');
      });

    this.websocket
      .listen<Column>('create-column-success')
      .pipe(takeUntilDestroyed())
      .subscribe((column) => {
        this.columnActions$.next({ type: 'create', column });
      });

    this.websocket
      .listen<string>('delete-column-success')
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        this.columnActions$.next({ type: 'delete', id });
      });

    this.websocket
      .listen<Task>('create-task-success')
      .pipe(takeUntilDestroyed())
      .subscribe((task) => {
        this.taskActions$.next({ type: 'create', task });
      });

    this.vm = toSignal(
      combineLatest({
        board: board$,
        columns: columns$,
        tasks: tasks$
      })
    );
  }

  protected createColumn(title: string): void {
    this.columnApiClient.create({ title, boardId: this.id });
  }

  protected deleteColumn(id: string): void {
    this.columnApiClient.delete(id, this.id);
  }

  protected createTask(title: string, columnId: string): void {
    this.taskApiClient.create({ title, boardId: this.id, columnId });
  }

  protected changeTitle(title: string): void {
    this.boardApiClient.update(this.id, { title });
  }

  protected delete(): void {
    this.boardApiClient.delete(this.id);
  }
}
