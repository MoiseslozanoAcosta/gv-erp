import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button'; // 1. Importamos el módulo

@Component({
  selector: 'app-root',
  standalone: true, // Asegúrate de que tenga esto
  imports: [RouterOutlet, ButtonModule], // 2. Agregamos ButtonModule aquí
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gv-erp');
}