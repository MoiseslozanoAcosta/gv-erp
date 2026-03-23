import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { TicketService, Ticket, TicketStatus, TicketPriority, PRIORITY_LABELS, STATUS_LABELS } from '../../services/ticket.service';

@Component({
    selector: 'app-ticket-detail',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, TextareaModule, SelectModule, ToastModule],
    providers: [MessageService],
    templateUrl: './ticket-detail.html',
    styleUrl: './ticket-detail.css'
})
export class TicketDetailComponent implements OnInit {
    ticket = signal<Ticket | null>(null);
    editMode = signal(false);
    commentText = signal('');

    priorityOptions = Object.entries(PRIORITY_LABELS).map(([key, val]) => ({ value: key as TicketPriority, label: val.label, color: val.color }));
    statusOptions = Object.entries(STATUS_LABELS).map(([key, val]) => ({ value: key as TicketStatus, label: val.label }));

    statusLabels = STATUS_LABELS;
    priorityLabels = PRIORITY_LABELS;

    groupMembers = computed(() => {
        const g = this.auth.selectedGroup();
        if (!g) return [];
        return this.auth.getUsersInGroup(g.id).map(u => ({ value: u.id, label: u.nombreCompleto }));
    });

    // Lógica de Permisos
    isCreator = computed(() => this.ticket()?.createdBy === this.auth.currentUser()?.id);
    isAssignee = computed(() => this.ticket()?.assignedTo === this.auth.currentUser()?.id);
    canFullEdit = computed(() => this.isCreator() || this.auth.isSuperAdmin());
    canEdit = computed(() => this.isCreator() || this.isAssignee() || this.auth.isSuperAdmin());

    editForm: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthService,
        private ticketService: TicketService,
        private fb: FormBuilder,
        private msg: MessageService
    ) {
        this.editForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            status: ['pendiente'],
            assignedTo: [null],
            priority: ['中'],
            dueDate: [null]
        });
    }

    ngOnInit() {
        const id = Number(this.route.snapshot.params['id']);
        const t = this.ticketService.getById(id);
        if (!t) { this.router.navigate(['/tickets']); return; }
        this.ticket.set(t);
        this.fillForm(t);
    }

    fillForm(t: Ticket) {
        this.editForm.patchValue({
            title: t.title,
            description: t.description,
            status: t.status,
            assignedTo: t.assignedTo,
            priority: t.priority,
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : null
        });

        // Si no es el creador o superadmin, bloqueamos campos críticos
        if (!this.canFullEdit()) {
            ['title', 'description', 'assignedTo', 'priority', 'dueDate'].forEach(field => {
                this.editForm.get(field)?.disable();
            });
        }
    }

    toggleEdit() { 
        if (!this.editMode()) {
            this.fillForm(this.ticket()!);
        }
        this.editMode.update(v => !v); 
    }

    onSave() {
        const user = this.auth.currentUser()!;
        const val = this.editForm.getRawValue(); // Obtiene valores incluso de campos disabled
        
        this.ticketService.update(this.ticket()!.id, {
            title: val.title,
            description: val.description,
            status: val.status,
            assignedTo: val.assignedTo,
            priority: val.priority,
            dueDate: val.dueDate ? new Date(val.dueDate) : null
        }, user.id, user.nombreCompleto);

        const updated = this.ticketService.getById(this.ticket()!.id)!;
        this.ticket.set(updated);
        this.editMode.set(false);
        this.msg.add({ severity: 'success', summary: 'Guardado', detail: 'Ticket actualizado correctamente' });
    }

    onAddComment() {
        const text = this.commentText().trim();
        if (!text) return;
        const user = this.auth.currentUser()!;
        this.ticketService.addComment(this.ticket()!.id, user.id, user.nombreCompleto, text);
        this.ticket.set(this.ticketService.getById(this.ticket()!.id)!);
        this.commentText.set('');
    }

    getAssigneeName(userId: number | null): string {
        if (!userId) return 'Sin asignar';
        return this.auth.getUserById(userId)?.nombreCompleto ?? 'Desconocido';
    }

    getCreatorName(userId: number): string {
        return this.auth.getUserById(userId)?.nombreCompleto ?? 'Desconocido';
    }

    onDelete() {
        if (!confirm('¿Seguro que deseas eliminar este ticket permanentemente?')) return;
        this.ticketService.delete(this.ticket()!.id);
        this.router.navigate(['/tickets']);
    }
}