import { Component } from '@angular/core'; // <--- ESTO CAMBIÓ
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './user.html'
})
export class UserComponent {
  userForm: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder, private messageService: MessageService) {
    this.userForm = this.fb.group({
      usuario: [{ value: 'admin_erp', disabled: true }, Validators.required],
      email: [{ value: 'admin@gmail.com', disabled: true }, [Validators.required, Validators.email]],
      nombreCompleto: [{ value: 'Moises Lozano Acosta', disabled: true }, Validators.required],
      direccion: [{ value: 'Santiago de Querétaro, México', disabled: true }, Validators.required],
      telefono: [{ value: '4421234567', disabled: true }, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      fechaNacimiento: [{ value: '1990-01-01', disabled: true }, Validators.required]
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.isEditing ? this.userForm.enable() : this.userForm.disable();
    if (!this.isEditing) {
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Perfil guardado' });
    }
  }

  deleteProfile() {
    this.messageService.add({ severity: 'error', summary: 'Eliminar', detail: 'Solicitud enviada' });
  }
}