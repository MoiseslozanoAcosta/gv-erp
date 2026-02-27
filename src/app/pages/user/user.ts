import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './user.html'
})
export class UserComponent {
  userData = {
    usuario: 'admin_erp',
    nombreCompleto: 'Moises Lozano Acosta',
    email: 'admin@gmail.com',
    direccion: 'Santiago de Querétaro, México',
    telefono: '4421234567',
    fechaNacimiento: '1990-01-01',
    password: 'Admin123#'
  };
}