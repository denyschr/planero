import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';

import { UserApiClient } from '../user-api-client';

@Component({
  selector: 'pln-login',
  templateUrl: './login.html',
  imports: [ReactiveFormsModule, Button, InputText, Message, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Login {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly userApiClient = inject(UserApiClient);

  protected readonly emailControl = this.formBuilder.control('', [
    Validators.required,
    Validators.email
  ]);
  protected readonly passwordControl = this.formBuilder.control('', [
    Validators.required,
    Validators.minLength(8)
  ]);
  protected readonly form = this.formBuilder.group({
    email: this.emailControl,
    password: this.passwordControl
  });
  protected readonly submitted = signal(false);
  protected readonly failed = signal(false);

  protected submit(): void {
    this.submitted.set(true);
    this.failed.set(false);
    this.userApiClient.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/boards'),
      error: () => {
        this.submitted.set(false);
        this.failed.set(true);
      }
    });
  }
}
