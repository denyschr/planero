import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'pln-column-options',
  templateUrl: './column-options.html',
  imports: [Button, Menu],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnOptions {
  protected readonly items = signal<MenuItem[]>([
    {
      label: 'Options',
      items: [
        {
          label: 'Delete column',
          command: () => this.deleted.emit()
        }
      ]
    }
  ]);

  public readonly deleted = output<void>();
}
