import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink, Router } from '@angular/router'; // Importamos Router
import { ToastModule } from 'primeng/toast'; 
import { MessageService } from 'primeng/api'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, RouterLink, ToastModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  loginForm: FormGroup;

  private readonly USER_CORRECTO = 'admin@gmail.com';
  private readonly PASS_CORRECTA = 'Admin123';

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      if (email === this.USER_CORRECTO && password === this.PASS_CORRECTA) {
        this.messageService.add({
          severity: 'success',
          summary: '¡Bienvenido!',
          detail: 'Acceso correcto al sistema ERP'
        });

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1200); // 

      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Acceso Denegado',
          detail: 'Correo o contraseña incorrectos'
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor ingresa todos los datos'
      });
    }
  }
}