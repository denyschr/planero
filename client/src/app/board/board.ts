import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, scan, startWith, switchMap, tap } from 'rxjs';

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

type ViewModel = {
  board: BoardType;
  columns: Column[];
  tasks: Task[];
};

@Component({
  selector: 'pln-board',
  templateUrl: './board.html',
  imports: [BoardTitleForm, ColumnForm, ColumnCard],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Board {
  private readonly boardApiClient = inject(BoardApiClient);
  private readonly columnApiClient = inject(ColumnApiClient);
  private readonly taskApiClient = inject(TaskApiClient);
  private readonly websocket = inject(Websocket);

  protected readonly id: string;
  protected readonly vm: Signal<ViewModel | undefined>;

  constructor() {
    const router = inject(Router);
    const route = inject(ActivatedRoute);

    this.id = route.snapshot.paramMap.get('id')!;
    this.boardApiClient.join(this.id);

    const board$ = this.boardApiClient
      .get(this.id)
      .pipe(
        switchMap((board) =>
          this.websocket.listen<BoardType>('update-board-success').pipe(startWith(board))
        )
      );
    const columns$ = this.columnApiClient.list(this.id).pipe(
      switchMap((columns) =>
        this.websocket.listen<Column>('create-column-success').pipe(
          scan((columns, newColumn) => [...columns, newColumn], columns),
          startWith(columns)
        )
      )
    );
    const tasks$ = this.taskApiClient.list(this.id).pipe(
      switchMap((tasks) =>
        this.websocket.listen<Task>('create-task-success').pipe(
          scan((tasks, newTask) => [...tasks, newTask], tasks),
          startWith(tasks)
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

  protected createTask(title: string, columnId: string): void {
    this.taskApiClient.create({ title, boardId: this.id, columnId });
  }

  protected changeTitle(title: string): void {
    this.boardApiClient.update(this.id, { title });
  }
}
