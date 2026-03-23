import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { TicketService, STATUS_LABELS, PRIORITY_LABELS } from '../../services/ticket.service';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, ToastModule],
    providers: [MessageService],
    templateUrl: './user-profile.html',
    styleUrl: './user-profile.css'
})
export class UserProfileComponent {
    currentUser = computed(() => this.auth.currentUser());
    isEditing = false;
    statusLabels = STATUS_LABELS;
    priorityLabels = PRIORITY_LABELS;

    form: FormGroup;

    myTickets = computed(() => {
        const u = this.currentUser();
        if (!u) return [];
        return this.ticketService.getByUser(u.id);
    });

    ticketSummary = computed(() => {
        const tickets = this.myTickets();
        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'pendiente').length,
            inProgress: tickets.filter(t => t.status === 'en-progreso').length,
            done: tickets.filter(t => t.status === 'hecho').length,
        };
    });

    userGroups = computed(() => {
        const u = this.currentUser();
        if (!u) return [];
        return this.auth.getGroupsForUser(u.id);
    });

    constructor(
        private auth: AuthService,
        private ticketService: TicketService,
        private fb: FormBuilder,
        private msg: MessageService
    ) {
        const u = this.auth.currentUser()!;
        this.form = this.fb.group({
            nombreCompleto: [{ value: u?.nombreCompleto, disabled: true }, Validators.required],
            email: [{ value: u?.email, disabled: true }, [Validators.required, Validators.email]],
            username: [{ value: u?.username, disabled: true }, Validators.required],
            direccion: [{ value: u?.direccion, disabled: true }],
            telefono: [{ value: u?.telefono, disabled: true }, [Validators.pattern('^[0-9]{10}$')]],
            fechaNacimiento: [{ value: u?.fechaNacimiento, disabled: true }],
        });
    }

    toggleEdit() {
        this.isEditing = !this.isEditing;
        if (this.isEditing) { this.form.enable(); this.form.get('email')?.disable(); }
        else { this.form.disable(); }
    }

    onSave() {
        const u = this.currentUser()!;
        this.auth.updateUser({ ...u, ...this.form.getRawValue() });
        this.isEditing = false;
        this.form.disable();
        this.msg.add({ severity: 'success', summary: 'Perfil actualizado', detail: 'Tus datos han sido guardados' });
    }

    userInitials() {
        const name = this.currentUser()?.nombreCompleto || '';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
}
