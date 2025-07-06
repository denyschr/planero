import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'pln-board-menu',
  templateUrl: './board-menu.html',
  imports: [Menu, Button],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardMenu {
  protected readonly items = signal<MenuItem[]>([
    {
      label: 'Menu',
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
