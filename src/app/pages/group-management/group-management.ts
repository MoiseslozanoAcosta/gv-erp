import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService, Group } from '../../services/auth.service';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './group-management.html',
  styleUrls: ['./group-management.css']
})
export class GroupManagementComponent {
  selectedGroup = computed(() => this.auth.selectedGroup());
  canAdd = computed(() => this.auth.hasPermission('group:add'));
  canEdit = computed(() => this.auth.hasPermission('group:edit'));
  canDelete = computed(() => this.auth.hasPermission('group:delete'));

  members = computed(() => {
    const g = this.selectedGroup();
    if (!g) return [];
    return this.auth.getUsersInGroup(g.id);
  });

  groupName = signal('');
  groupDesc = signal('');
  newMemberEmail = signal('');
  editingName = signal(false);

  constructor(private auth: AuthService, private msg: MessageService) {
    const g = this.selectedGroup();
    if (g) {
      this.groupName.set(g.nombre);
      this.groupDesc.set(g.descripcion);
    }
  }

  saveGroupName() {
    const g = this.selectedGroup();
    if (!g) return;

    const updatedGroup: Group = {
      ...g,
      nombre: this.groupName(),
      descripcion: this.groupDesc()
    };

    // ✅ Ahora llama al método persistente del servicio
    this.auth.updateGroup(updatedGroup);
    this.auth.selectedGroup.set(updatedGroup);

    this.editingName.set(false);
    this.msg.add({ severity: 'success', summary: 'Grupo actualizado', detail: 'Los datos del grupo se guardaron' });
  }

  addMember() {
    const email = this.newMemberEmail().trim();
    if (!email) return;

    // 1. Buscamos al usuario en la lista global de usuarios (Signal actualizado)
    const user = this.auth.users().find(u => u.email === email);
    if (!user) {
      this.msg.add({ severity: 'error', summary: 'No encontrado', detail: 'No existe usuario con ese email' });
      return;
    }

    // 2. OBTENER EL ESTADO REAL DEL GRUPO: 
    // En lugar de usar la variable 'g' que puede estar desfasada, 
    // buscamos el grupo directamente en el signal de grupos del servicio.
    const currentGroup = this.selectedGroup();
    if (!currentGroup) return;

    const latestGroupData = this.auth.groups().find(group => group.id === currentGroup.id);

    // 3. VALIDACIÓN: Usamos los IDs del grupo obtenidos directamente del store global
    if (latestGroupData && latestGroupData.memberIds.includes(user.id)) {
      this.msg.add({ severity: 'warn', summary: 'Ya existe', detail: 'El usuario ya es miembro del grupo' });
      return;
    }

    // 4. EJECUCIÓN: Agregamos al usuario
    this.auth.addUserToGroup(user.id, currentGroup.id);

    // 5. REFRESCAR EL SELECTED GROUP:
    // Es vital actualizar el signal de 'selectedGroup' para que el componente 
    // se entere del cambio en los IDs.
    const updated = this.auth.groups().find(group => group.id === currentGroup.id);
    if (updated) {
        this.auth.selectedGroup.set({...updated});
    }

    this.newMemberEmail.set('');
    this.msg.add({ severity: 'success', summary: 'Miembro añadido', detail: `${user.nombreCompleto} se unió al grupo` });
  }

  removeMember(userId: number) {
    const g = this.selectedGroup()!;
    const user = this.auth.getUserById(userId);
    if (!confirm(`¿Eliminar a ${user?.nombreCompleto} del grupo?`)) return;
    this.auth.removeUserFromGroup(userId, g.id);
    this.msg.add({ severity: 'warn', summary: 'Miembro eliminado', detail: `${user?.nombreCompleto} fue removido del grupo` });
  }
}