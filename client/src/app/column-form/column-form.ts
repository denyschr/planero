import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';

@Component({
  selector: 'pln-column-form',
  templateUrl: './column-form.html',
  imports: [FormsModule, Button],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnForm {
  private readonly injector = inject(Injector);

  protected readonly title = signal('');
  protected readonly activated = signal(false);

  public readonly created = output<string>();
  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInputRef');

  protected activate(): void {
    this.activated.set(true);

    afterNextRender(
      {
        write: () => {
          this.titleInput()!.nativeElement.focus();
        }
      },
      { injector: this.injector }
    );
  }

  protected cancel(): void {
    this.activated.set(false);
    this.title.set('');
  }

  protected submit(): void {
    const title = this.title().trim();
    if (title === '') {
      return;
    }
    this.activated.set(false);
    this.created.emit(title);
    this.title.set('');
  }
}
