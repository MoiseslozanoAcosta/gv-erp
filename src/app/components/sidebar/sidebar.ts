import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  currentUser = computed(() => this.auth.currentUser());
  selectedGroup = computed(() => this.auth.selectedGroup());

  userInitials = computed(() => {
    const name = this.currentUser()?.nombreCompleto || '';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  });

  canManageGroup = computed(() =>
    this.auth.hasPermission('group:add') ||
    this.auth.hasPermission('group:edit') ||
    this.auth.hasPermission('group:delete')
  );

  isSuperAdmin = computed(() => this.auth.isSuperAdmin());

  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
    window.location.href = '/login';
  }
}