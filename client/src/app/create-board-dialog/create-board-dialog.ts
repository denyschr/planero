import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { BoardApiClient } from '../board-api-client';

@Component({
  selector: 'pln-create-board-dialog',
  templateUrl: './create-board-dialog.html',
  imports: [Dialog, Button, InputText, ReactiveFormsModule, Message],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateBoardDialog {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly boardApiClient = inject(BoardApiClient);

  protected readonly titleControl = this.formBuilder.control('', [Validators.required]);
  protected readonly form = this.formBuilder.group({
    title: this.titleControl
  });
  protected readonly submitted = signal(false);

  public readonly visible = model.required<boolean>();
  public readonly created = output<void>();

  protected submit(): void {
    this.submitted.set(true);
    this.boardApiClient.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitted.set(false);
        this.created.emit();
        this.form.reset();
        this.visible.set(false);
      },
      error: () => {
        this.submitted.set(false);
        this.messageService.add({ severity: 'error', summary: 'Failed to create new board' });
      }
    });
  }
}
