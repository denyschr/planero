import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { startWith, Subject, switchMap } from 'rxjs';

import { BoardApiClient } from '../board-api-client';
import { CreateBoardDialog } from '../create-board-dialog/create-board-dialog';

@Component({
  selector: 'pln-boards',
  templateUrl: './boards.html',
  imports: [RouterLink, CreateBoardDialog],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Boards {
  private readonly boardApiClient = inject(BoardApiClient);

  public readonly refreshSubject = new Subject<void>();

  protected readonly boards = toSignal(
    this.refreshSubject.pipe(
      startWith(undefined),
      switchMap(() => this.boardApiClient.list())
    )
  );
  protected readonly dialogVisible = signal(false);

  protected create(): void {
    this.refreshSubject.next();
  }
}
