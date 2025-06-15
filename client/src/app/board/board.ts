import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, tap } from 'rxjs';

import { Board as BoardType } from '../models/board';
import { BoardApiClient } from '../board-api-client';
import { BoardTitleForm } from '../board-title-form/board-title-form';
import { ColumnApiClient } from '../column-api-client';
import { Column } from '../models/column';
import { ColumnForm } from '../column-form/column-form';
import { ColumnCard } from '../column-card/column-card';

type ViewModel = {
  board: BoardType;
  columns: Column[];
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

  protected readonly id: string;
  protected readonly vm: Signal<ViewModel | undefined>;

  constructor() {
    const router = inject(Router);
    const route = inject(ActivatedRoute);

    this.id = route.snapshot.paramMap.get('id')!;
    this.boardApiClient.join(this.id);

    const board$ = this.boardApiClient.get(this.id);
    const columns$ = this.columnApiClient.list(this.id);

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
        columns: columns$
      })
    );
  }

  protected create(title: string): void {
    this.columnApiClient.create({ title, boardId: this.id });
  }
}
