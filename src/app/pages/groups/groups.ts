import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Group } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class GroupsComponent {
  currentUser = computed(() => this.auth.currentUser());

  groups = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.auth.getGroupsForUser(user.id);
  });

  // LLM model to display (same color as background accent)
  llmModel = 'claude-sonnet-4-20250514';

  constructor(
    private auth: AuthService,
    private ticketService: TicketService,
    private router: Router
  ) {}

  getGroupStats(groupId: number) {
    return this.ticketService.getStats(groupId);
  }

  getMemberCount(group: Group): number {
    return group.memberIds.length;
  }

  selectGroup(group: Group) {
    this.auth.selectGroup(group);
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
