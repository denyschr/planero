import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'pln-board-options',
  templateUrl: './board-options.html',
  imports: [Menu, Button],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardOptions {
  protected readonly items = signal<MenuItem[]>([
    {
      label: 'Options',
      items: [
        {
          label: 'Delete this board',
          icon: 'pi pi-trash',
          command: () => this.deleted.emit()
        }
      ]
    }
  ]);

  public readonly deleted = output<void>();
}
