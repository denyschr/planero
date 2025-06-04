import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Ripple } from 'primeng/ripple';

import { UserApiClient } from '../user-api-client';

@Component({
  selector: 'pln-topbar',
  templateUrl: './topbar.html',
  imports: [RouterLink, Button, Menu, Ripple],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Topbar {
  private readonly userApiClient = inject(UserApiClient);

  protected readonly currentUser = this.userApiClient.currentUser;
  protected readonly menuItems = signal<MenuItem[]>([
    {
      separator: true
    },
    {
      label: 'Log out',
      icon: 'pi pi-sign-out',
      asButton: true,
      command: () => this.logout()
    }
  ]);

  protected logout(): void {
    this.userApiClient.logout();
  }
}
