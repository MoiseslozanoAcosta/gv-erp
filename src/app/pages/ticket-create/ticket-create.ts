import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { TicketService, TicketStatus, TicketPriority, PRIORITY_LABELS, STATUS_LABELS } from '../../services/ticket.service';

@Component({
    selector: 'app-ticket-create',
    standalone: true,
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        ButtonModule, 
        InputTextModule, 
        TextareaModule, 
        SelectModule, 
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './ticket-create.html',
    styleUrl: './ticket-create.css'
})
export class TicketCreateComponent {
    form: FormGroup;

    priorityOptions = Object.entries(PRIORITY_LABELS).map(([key, val]) => ({
        value: key as TicketPriority, 
        label: val.label, 
        color: val.color
    }));

    statusOptions = Object.entries(STATUS_LABELS).map(([key, val]) => ({
        value: key as TicketStatus, 
        label: val.label
    }));

    groupMembers = computed(() => {
        const g = this.auth.selectedGroup();
        if (!g) return [];
        return this.auth.getUsersInGroup(g.id).map(u => ({ 
            value: u.id, 
            label: u.nombreCompleto 
        }));
    });

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private ticketService: TicketService,
        private router: Router,
        private msg: MessageService
    ) {
        this.form = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            status: ['pendiente' as TicketStatus, Validators.required],
            assignedTo: [null],
            priority: ['中' as TicketPriority, Validators.required], // Media por defecto
            dueDate: [null]
        });
    }

    onCreate() {
        if (this.form.invalid) {
            this.msg.add({ 
                severity: 'warn', 
                summary: 'Campos requeridos', 
                detail: 'Revisa el formulario' 
            });
            return;
        }

        const user = this.auth.currentUser();
        const group = this.auth.selectedGroup();

        if (!user || !group) {
            this.msg.add({ severity: 'error', summary: 'Error', detail: 'Sesión o grupo no válido' });
            return;
        }

        const val = this.form.value;
        
        try {
            const ticket = this.ticketService.create({
                groupId: group.id,
                title: val.title,
                description: val.description,
                status: val.status,
                assignedTo: val.assignedTo,
                priority: val.priority,
                createdBy: user.id,
                createdAt: new Date(),
                dueDate: val.dueDate ? new Date(val.dueDate) : null
            });

            this.msg.add({ 
                severity: 'success', 
                summary: 'Ticket creado', 
                detail: `#${ticket.id} ${ticket.title}` 
            });

            // ✅ Redirección tras éxito: 
            // Esperamos un poco para que el usuario vea el Toast y mandamos al detalle o dashboard
            setTimeout(() => {
                this.router.navigate(['/dashboard']); 
            }, 800);

        } catch (error) {
            this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el ticket' });
        }
    }

    /**
     * ✅ Al cancelar, regresamos al Dashboard.
     * Esto evita que el authGuard se confunda y mande al usuario al login.
     */
    onCancel() {
        this.router.navigate(['/dashboard']);
    }
}