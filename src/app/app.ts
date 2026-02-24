import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; 
import { ButtonModule } from 'primeng/button'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,    
    ButtonModule   
  ],
  templateUrl: './app.html', // Asegúrate que el archivo se llame app.html
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'gv-erp';
}