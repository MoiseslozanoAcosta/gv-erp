import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar'; // Ajusta la ruta a tu carpeta

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {}