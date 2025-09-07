import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

import { Board as BoardType } from '../models/board';
import { BoardApiClient } from '../board-api-client';
import { ColumnApiClient } from '../column-api-client';
import { Column } from '../models/column';
import { ColumnCard } from '../column-card/column-card';
import { Websocket } from '../websocket';
import { TaskApiClient } from '../task-api-client';
import { Task } from '../models/task';
import { BoardMenu } from '../board-menu/board-menu';
import { BoardState } from '../board-state';
import { InplaceForm } from '../inplace-form/inplace-form';
import { InplaceInput } from '../inplace-input/inplace-input';

@Component({
  selector: 'pln-board',
  templateUrl: './board.html',
  imports: [ColumnCard, BoardMenu, RouterOutlet, InplaceForm, InplaceInput, CdkDrag, CdkDropList],
  providers: [BoardState],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Board {
  private readonly boardApiClient = inject(BoardApiClient);
  private readonly columnApiClient = inject(ColumnApiClient);
  private readonly taskApiClient = inject(TaskApiClient);
  private readonly boardState = inject(BoardState);
  private readonly websocket = inject(Websocket);

  protected readonly id: string;
  protected readonly vm = computed(() => ({
    board: this.boardState.board(),
    columns: this.boardState.columns(),
    tasks: this.boardState.tasks(),
    loaded: this.boardState.loaded()
  }));

  constructor() {
    const router = inject(Router);
    const route = inject(ActivatedRoute);

    router.events
      .pipe(
        filter((event) => event instanceof NavigationStart && !event.url.includes('/boards')),
        tap(() => {
          this.boardApiClient.leave(this.id);
        })
      )
      .subscribe();

    this.id = route.snapshot.paramMap.get('id')!;
    this.boardApiClient.join(this.id);
    this.boardState.idSubject.next(this.id);

    this.websocket
      .listen<BoardType>('update-board-success')
      .pipe(takeUntilDestroyed())
      .subscribe((board) => {
        this.boardState.updateBoard(board);
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
        this.boardState.addColumn(column);
      });

    this.websocket
      .listen<Column>('update-column-success')
      .pipe(takeUntilDestroyed())
      .subscribe((column) => {
        this.boardState.updateColumn(column);
      });

    this.websocket
      .listen<string>('delete-column-success')
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        this.boardState.deleteColumn(id);
      });

    this.websocket
      .listen<Column[]>('reorder-columns-success')
      .pipe(takeUntilDestroyed())
      .subscribe((columns) => {
        this.boardState.setColumns(columns);
      });

    this.websocket
      .listen<Task>('create-task-success')
      .pipe(takeUntilDestroyed())
      .subscribe((task) => {
        this.boardState.addTask(task);
      });

    this.websocket
      .listen<Task>('update-task-success')
      .pipe(takeUntilDestroyed())
      .subscribe((task) => {
        this.boardState.updateTask(task);
      });

    this.websocket
      .listen<string>('delete-task-success')
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        this.boardState.deleteTask(id);
      });
  }

  protected updateBoardTitle(title: string): void {
    this.boardApiClient.update(this.id, { title });
  }

  protected deleteBoard(): void {
    this.boardApiClient.delete(this.id);
  }

  protected updateColumnTitle(title: string, id: string): void {
    this.columnApiClient.update(id, this.id, { title });
  }

  protected createColumn(title: string): void {
    this.columnApiClient.create({ title, boardId: this.id });
  }

  protected deleteColumn(id: string): void {
    this.columnApiClient.delete(id, this.id);
  }

  protected dropColumn(event: CdkDragDrop<Column[]>): void {
    const columns = [...this.vm().columns];
    moveItemInArray(columns, event.previousIndex, event.currentIndex);

    this.boardState.setColumns(columns);

    const updates = columns.map((column, index) => ({
      id: column.id,
      order: index
    }));

    this.columnApiClient.reorder(this.id, updates);
  }

  protected createTask(title: string, columnId: string): void {
    this.taskApiClient.create({ title, boardId: this.id, columnId });
  }
}
