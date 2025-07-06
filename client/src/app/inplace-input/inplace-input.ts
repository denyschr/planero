import { ChangeDetectionStrategy, Component, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Inplace } from 'primeng/inplace';
import { InputText } from 'primeng/inputtext';
import { AutoFocus } from 'primeng/autofocus';

@Component({
  selector: 'pln-inplace-input',
  templateUrl: './inplace-input.html',
  imports: [FormsModule, Inplace, InputText, AutoFocus],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InplaceInput {
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
