import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { BoardApiClient } from '../board-api-client';

const BOARD_BACKGROUNDS = [
  'rgb(0, 121, 191)',
  'rgb(210, 144, 52)',
  'rgb(81, 152, 57)',
  'rgb(176, 70, 50)',
  'rgb(137, 96, 158)',
  'rgb(205, 90, 145)'
];

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

  protected readonly backgrounds = signal(BOARD_BACKGROUNDS);
  protected readonly backgroundControl = this.formBuilder.control(this.backgrounds()[0]);
  protected readonly titleControl = this.formBuilder.control('', [Validators.required]);
  protected readonly form = this.formBuilder.group({
    background: this.backgroundControl,
    title: this.titleControl
  });

  public readonly visible = model.required<boolean>();
  public readonly created = output<void>();

  protected submit(): void {
    this.form.disable();
    const { title, background: backgroundColor } = this.form.getRawValue();
    this.boardApiClient.create({ title, backgroundColor }).subscribe({
      next: () => {
        this.visible.set(false);
        this.created.emit();
      },
      error: () => {
        this.form.enable();
        this.messageService.add({ severity: 'error', summary: 'Failed to create new board' });
      }
    });
  }
}
