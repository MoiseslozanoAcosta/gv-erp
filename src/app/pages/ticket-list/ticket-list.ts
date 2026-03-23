import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AuthService } from '../../services/auth.service';
import { TicketService, STATUS_LABELS, PRIORITY_LABELS } from '../../services/ticket.service';

@Component({
    selector: 'app-ticket-list',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        FormsModule, 
        ButtonModule, 
        InputTextModule, 
        SelectModule
    ],
    templateUrl: './ticket-list.html',
    styleUrl: './ticket-list.css'
})
export class TicketListComponent {
    // Signals para filtros
    searchText = signal('');
    filterStatus = signal<string | null>(null);
    filterPriority = signal<string | null>(null);
    filterAssigned = signal<number | null>(null);
    filterMine = signal(false);
    filterUnassigned = signal(false);
    filterHighPriority = signal(false);

    // Datos computados
    selectedGroup = computed(() => this.auth.selectedGroup());
    
    tickets = computed(() => {
        const g = this.selectedGroup();
        if (!g) return [];
        
        let list = this.ticketService.getByGroup(g.id);
        const search = this.searchText().toLowerCase();
        const user = this.auth.currentUser();

        if (search) {
            list = list.filter(t => 
                t.title.toLowerCase().includes(search) || 
                t.id.toString().includes(search)
            );
        }

        if (this.filterStatus()) list = list.filter(t => t.status === this.filterStatus());
        if (this.filterPriority()) list = list.filter(t => t.priority === this.filterPriority());
        if (this.filterAssigned()) list = list.filter(t => t.assignedTo === this.filterAssigned());
        if (this.filterMine() && user) list = list.filter(t => t.assignedTo === user.id);
        if (this.filterUnassigned()) list = list.filter(t => t.assignedTo === null);
        if (this.filterHighPriority()) list = list.filter(t => t.priority === '高');

        return list;
    });

    statusOptions = [
        { label: 'Todos los estados', value: null },
        ...Object.entries(STATUS_LABELS).map(([key, val]) => ({ label: val.label, value: key }))
    ];

    priorityOptions = [
        { label: 'Todas las prioridades', value: null },
        ...Object.entries(PRIORITY_LABELS).map(([key, val]) => ({ label: val.label, value: key }))
    ];

    memberOptions = computed(() => {
        const g = this.selectedGroup();
        if (!g) return [];
        return [
            { label: 'Todos los miembros', value: null },
            ...this.auth.getUsersInGroup(g.id).map(u => ({ label: u.nombreCompleto, value: u.id }))
        ];
    });

    statusLabels = STATUS_LABELS;
    priorityLabels = PRIORITY_LABELS;

    // ✅ Inyectado como PUBLIC para que el HTML acceda a auth.hasPermission
    constructor(
        public auth: AuthService, 
        private ticketService: TicketService
    ) {}

    getAssigneeName(userId: number | null): string {
        if (!userId) return 'Sin asignar';
        return this.auth.getUserById(userId)?.nombreCompleto ?? 'Desconocido';
    }

    toggleFilterMine() { this.filterMine.set(!this.filterMine()); }
    toggleFilterUnassigned() { this.filterUnassigned.set(!this.filterUnassigned()); }
    toggleFilterHighPriority() { this.filterHighPriority.set(!this.filterHighPriority()); }
    
    clearFilters() {
        this.searchText.set('');
        this.filterStatus.set(null);
        this.filterPriority.set(null);
        this.filterAssigned.set(null);
        this.filterMine.set(false);
        this.filterUnassigned.set(false);
        this.filterHighPriority.set(false);
    }
}