import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

import { Board as BoardType } from '../models/board';
import { BoardApiClient } from '../board-api-client';
import { BoardTitleForm } from '../board-title-form/board-title-form';

type ViewModel = {
  board: BoardType;
};

@Component({
  selector: 'pln-board',
  templateUrl: './board.html',
  imports: [BoardTitleForm],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Board {
  private readonly boardApiClient = inject(BoardApiClient);

  protected readonly vm: Signal<ViewModel | undefined>;

  constructor() {
    const route = inject(ActivatedRoute);

    const id = route.snapshot.paramMap.get('id')!;
    const board$ = this.boardApiClient.get(id);

    this.vm = toSignal(
      combineLatest({
        board: board$
      })
    );
  }
}
