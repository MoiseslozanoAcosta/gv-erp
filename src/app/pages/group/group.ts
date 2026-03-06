import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, CardModule, ToastModule],
  providers: [MessageService],
  templateUrl: './group.html'
})
export class GroupComponent {
  // Lista de grupos (READ)
  groups: any[] = [
    { id: 1, nivel: 'Senior', autor: 'Moises L.', nombre: 'Backend Core', integrantes: 2, tickets: 5, descripcion: 'API Principal' },
    { id: 2, nivel: 'Junior', autor: 'Jorge T.', nombre: 'UI Components', integrantes: 1, tickets: 2, descripcion: 'Vistas PrimeNG' }
  ];

  group: any = {};
  displayDialog: boolean = false;
  isNew: boolean = false;

  constructor(private messageService: MessageService) {}

  // Abrir diálogo para Nuevo (CREATE)
  openNew() {
    this.group = {};
    this.isNew = true;
    this.displayDialog = true;
  }

  // Abrir diálogo para Editar (UPDATE)
  editGroup(group: any) {
    this.group = { ...group };
    this.isNew = false;
    this.displayDialog = true;
  }

  // Guardar (CREATE o UPDATE)
  saveGroup() {
    if (this.isNew) {
      this.group.id = this.groups.length + 1;
      this.groups.push(this.group);
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Grupo Creado' });
    } else {
      const index = this.groups.findIndex(g => g.id === this.group.id);
      this.groups[index] = this.group;
      this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Grupo Actualizado' });
    }
    this.displayDialog = false;
  }

  // Eliminar (DELETE)
  deleteGroup(id: number) {
    this.groups = this.groups.filter(g => g.id !== id);
    this.messageService.add({ severity: 'warn', summary: 'Eliminado', detail: 'Registro borrado' });
  }
}