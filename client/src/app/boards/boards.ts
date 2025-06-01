import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { BoardApiClient } from '../board-api-client';

@Component({
  selector: 'pln-boards',
  templateUrl: './boards.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Boards {
  private readonly boardApiClient = inject(BoardApiClient);

  protected readonly boards = toSignal(this.boardApiClient.list());
}
