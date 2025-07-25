import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Router, RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Message } from 'primeng/message';

import { UserApiClient } from '../user-api-client';

@Component({
  selector: 'pln-register',
  templateUrl: './register.html',
  imports: [ReactiveFormsModule, RouterLink, Button, InputText, Message],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class Register {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly userApiClient = inject(UserApiClient);

  protected readonly usernameControl = this.formBuilder.control('', [Validators.required]);
  protected readonly emailControl = this.formBuilder.control('', [
    Validators.required,
    Validators.email
  ]);
  protected readonly passwordControl = this.formBuilder.control('', [
    Validators.required,
    Validators.minLength(8)
  ]);
  protected readonly form = this.formBuilder.group({
    username: this.usernameControl,
    email: this.emailControl,
    password: this.passwordControl
  });
  protected readonly submitted = signal(false);
  protected readonly failed = signal(false);

  protected submit(): void {
    this.submitted.set(true);
    this.failed.set(false);
    this.userApiClient.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/boards'),
      error: () => {
        this.submitted.set(false);
        this.failed.set(true);
      }
    });
  }
}
