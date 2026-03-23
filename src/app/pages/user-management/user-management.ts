import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, DialogModule, ToastModule],
  providers: [MessageService],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent {
  users = computed(() => this.auth.users());
  allPermissions = AuthService.PERMISSIONS;

  showDialog = signal(false);
  editingUser = signal<User | null>(null);
  selectedPermissions = signal<string[]>([]);
  userForm: FormGroup;

  constructor(private auth: AuthService, private fb: FormBuilder, private msg: MessageService) {
    this.userForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      direccion: [''],
      telefono: ['', [Validators.pattern('^[0-9]{10}$')]],
      fechaNacimiento: [''],
    });
  }

  isSuperAdmin() { return this.auth.isSuperAdmin(); }
  
  hasPerm(perm: string) { 
    return this.selectedPermissions().includes(perm); 
  }

  openCreate() {
    this.editingUser.set(null);
    this.userForm.reset();
    this.selectedPermissions.set([]);
    this.showDialog.set(true);
  }

  openEdit(user: User) {
    this.editingUser.set(user);
    this.userForm.patchValue(user);
    this.selectedPermissions.set([...user.permissions]);
    this.showDialog.set(true);
  }

  deleteUser(user: User) {
    if (user.id === 1) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se puede eliminar al SuperAdmin' });
      return;
    }
    
    if (confirm(`¿Estás seguro de eliminar a ${user.nombreCompleto}?`)) {
      // Usamos el método del servicio que sí actualiza el LocalStorage
      this.auth.deleteUser(user.id);
      this.msg.add({ severity: 'warn', summary: 'Eliminado', detail: 'Usuario borrado permanentemente' });
    }
  }

  togglePermission(perm: string) {
    this.selectedPermissions.update(perms =>
      perms.includes(perm) ? perms.filter(p => p !== perm) : [...perms, perm]
    );
  }

  onSave() {
    if (this.userForm.invalid) return;
    const val = this.userForm.getRawValue();
    const editing = this.editingUser();

    if (editing) {
      const updatedUser: User = {
        ...editing,
        ...val,
        permissions: [...this.selectedPermissions()]
      };
      this.auth.updateUser(updatedUser);
      this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado' });
    } else {
      this.auth.register(val);
      this.msg.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado' });
    }
    this.showDialog.set(false);
  }
}