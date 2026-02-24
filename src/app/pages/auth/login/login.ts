import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Para los formularios
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast'; // Para las alertas UX
import { MessageService } from 'primeng/api'; // El servicio de mensajes

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, RouterLink, ToastModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  loginForm: FormGroup;

  // CREDENCIALES HARDCODEADAS (Las que validará el sistema)
  private readonly USER_CORRECTO = 'admin@gmail.com';
  private readonly PASS_CORRECTA = 'Admin123';

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {
    // Inicializamos el formulario con validaciones básicas
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      // Validación de credenciales
      if (email === this.USER_CORRECTO && password === this.PASS_CORRECTA) {
        this.messageService.add({
          severity: 'success',
          summary: '¡Bienvenido!',
          detail: 'Acceso correcto al sistema ERP'
        });
        // Aquí podrías navegar a otra página después de 1 segundo
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