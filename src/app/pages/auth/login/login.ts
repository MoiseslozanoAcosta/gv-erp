import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    RouterLink,
    ToastModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  showPassword = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private auth: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  fillDemo(email: string, password: string) {
    this.loginForm.patchValue({ email, password });
  }

  onLogin() {
    if (!this.loginForm.valid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor ingresa todos los datos'
      });
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;
    const success = this.auth.login(email, password);

    if (success) {
      this.messageService.add({
        severity: 'success',
        summary: '¡Bienvenido!',
        detail: 'Acceso correcto al sistema ERP'
      });
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/groups']);
      }, 800);
    } else {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Acceso Denegado',
        detail: 'Correo o contraseña incorrectos'
      });
    }
  }
}