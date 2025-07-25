import { ChangeDetectionStrategy, Component, model, output } from '@angular/core';
import { Inplace } from 'primeng/inplace';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoFocus } from 'primeng/autofocus';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'pln-inplace-textarea',
  templateUrl: './inplace-textarea.html',
  imports: [Inplace, ReactiveFormsModule, FormsModule, AutoFocus, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InplaceTextarea {
  private initialValue = '';

  public readonly value = model.required<string>();
  public readonly valueChanged = output<string>();

  protected activate(): void {
    this.initialValue = this.value();
  }

  protected close(): void {
    const currentValue = this.value().trim();
    if (currentValue === '') {
      this.value.set(this.initialValue);
    } else if (currentValue !== this.initialValue) {
      this.valueChanged.emit(currentValue);
    }
  }
}
