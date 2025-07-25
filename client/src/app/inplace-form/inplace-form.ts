import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Inplace } from 'primeng/inplace';
import { AutoFocus } from 'primeng/autofocus';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';

@Component({
  selector: 'pln-inplace-form',
  templateUrl: './inplace-form.html',
  imports: [FormsModule, Inplace, AutoFocus, Textarea, Button],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InplaceForm {
  protected value = '';

  public readonly displayText = input.required<string>();
  public readonly displayIcon = input<string>();
  public readonly placeholder = input<string>();
  public readonly created = output<string>();

  protected add(textarea: HTMLTextAreaElement, event?: Event): void {
    event?.preventDefault();
    const currentValue = this.value.trim();
    if (currentValue !== '') {
      this.created.emit(currentValue);
      this.value = '';
      textarea.focus();
    }
  }
}
