import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'pln-board-title-form',
  templateUrl: './board-title-form.html',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardTitleForm {
  private readonly injector = inject(Injector);

  private originalValue = '';
  protected readonly editing = signal(false);

  public readonly value = model.required<string>();
  public readonly changed = output<string>();
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('inputRef');

  protected startEditing(): void {
    this.originalValue = this.value();
    this.editing.set(true);

    afterNextRender(
      {
        write: () => {
          const input = this.input().nativeElement;
          input.focus();
          input.select();
        }
      },
      { injector: this.injector }
    );
  }

  protected stopEditing(): void {
    if (!this.editing()) {
      return;
    }

    const currentValue = this.value().trim();
    if (currentValue === '') {
      this.value.set(this.originalValue);
    } else if (currentValue !== this.originalValue) {
      this.changed.emit(currentValue);
    }

    this.editing.set(false);
  }
}
