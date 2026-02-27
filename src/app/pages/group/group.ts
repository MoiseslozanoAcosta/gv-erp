import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule],
  templateUrl: './group.html'
})
export class GroupComponent {
  groupInfo = {
    nombre: 'Equipo de Desarrollo ERP',
    totalMiembros: 2,
    avances: '85%',
    miembros: [
      { nombre: 'Moises Lozano Acosta', rol: 'Líder de Proyecto' },
    ]
  };
}