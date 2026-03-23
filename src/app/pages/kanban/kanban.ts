import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../services/auth.service';
import { TicketService, Ticket, TicketStatus, STATUS_LABELS, PRIORITY_LABELS } from '../../services/ticket.service';

@Component({
    selector: 'app-kanban',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, DialogModule],
    templateUrl: './kanban.html',
    styleUrl: './kanban.css'
})
export class KanbanComponent {
    selectedGroup = computed(() => this.auth.selectedGroup());
    currentUser = computed(() => this.auth.currentUser());
    llmModel = 'claude-sonnet-4-20250514';

    statusLabels = STATUS_LABELS;
    priorityLabels = PRIORITY_LABELS;

    columns: TicketStatus[] = ['pendiente', 'en-progreso', 'revision', 'hecho', 'bloqueado'];

    filterMine = signal(false);
    filterUnassigned = signal(false);
    filterHighPriority = signal(false);

    draggedTicket = signal<Ticket | null>(null);

    groupTickets = computed(() => {
        const g = this.selectedGroup();
        if (!g) return [];
        let tickets = this.ticketService.getByGroup(g.id);
        if (this.filterMine()) tickets = tickets.filter(t => t.assignedTo === this.currentUser()?.id);
        if (this.filterUnassigned()) tickets = tickets.filter(t => !t.assignedTo);
        if (this.filterHighPriority()) tickets = tickets.filter(t => ['极高', '高'].includes(t.priority));
        return tickets;
    });

    getColumnTickets(status: TicketStatus): Ticket[] {
        return this.groupTickets().filter(t => t.status === status);
    }

    // ✅ Cambiado a public para resolver el error del template
    constructor(public auth: AuthService, private ticketService: TicketService) { }

    getAssigneeName(userId: number | null): string {
        if (!userId) return 'Sin asignar';
        const name = this.auth.getUserById(userId)?.nombreCompleto ?? '';
        return name.split(' ').slice(0, 2).join(' ');
    }

    onDragStart(ticket: Ticket) {
        this.draggedTicket.set(ticket);
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    onDrop(event: DragEvent, status: TicketStatus) {
        event.preventDefault();
        const ticket = this.draggedTicket();
        if (!ticket || ticket.status === status) return;
        const user = this.currentUser();
        if (!user) return;
        this.ticketService.update(ticket.id, { status }, user.id, user.nombreCompleto);
        this.draggedTicket.set(null);
    }

    toggleFilterMine() { this.filterMine.update(v => !v); }
    toggleFilterUnassigned() { this.filterUnassigned.update(v => !v); }
    toggleFilterHighPriority() { this.filterHighPriority.update(v => !v); }

    isOverdue(ticket: Ticket): boolean {
        if (!ticket.dueDate) return false;
        return new Date(ticket.dueDate) < new Date() && ticket.status !== 'hecho';
    }
}