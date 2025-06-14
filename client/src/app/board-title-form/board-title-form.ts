import {
  afterNextRender,
  AfterRenderPhase,
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
  protected readonly editing = signal(false);

  public readonly value = model.required<string>();
  public readonly changed = output<string>();
  protected readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputRef');

  protected startEditing(): void {
    this.editing.set(true);

    afterNextRender(
      () => {
        const input = this.inputRef().nativeElement;
        input.focus();
        input.select();
      },
      { injector: this.injector, phase: AfterRenderPhase.Write }
    );
  }

  protected stopEditing(): void {
    if (!this.editing()) {
      return;
    }
    this.editing.set(false);
    this.changed.emit(this.value());
  }
}
