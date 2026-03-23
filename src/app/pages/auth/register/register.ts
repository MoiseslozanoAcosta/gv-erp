import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, RouterLink, ToastModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirm = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private auth: AuthService
  ) {
    this.registerForm = this.fb.group({
      usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nombreCompleto: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      fechaNacimiento: ['', [Validators.required, this.validarMayoriaEdad]],
      password: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/.*[#$%&@].*/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.validarPasswordsIguales });
  }

  validarMayoriaEdad(control: AbstractControl) {
    const fechaNac = new Date(control.value);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    if (edad < 18) return { menorEdad: true };
    return null;
  }

  validarPasswordsIguales(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { noCoincide: true };
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Revisa todos los campos antes de continuar'
      });
      return;
    }

    this.loading = true;
    const val = this.registerForm.value;

    const ok = this.auth.register({
      username: val.usuario,
      email: val.email,
      nombreCompleto: val.nombreCompleto,
      direccion: val.direccion,
      telefono: val.telefono,
      fechaNacimiento: val.fechaNacimiento,
      password: val.password
    });

    if (!ok) {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Email ya registrado',
        detail: 'Ya existe una cuenta con ese correo electrónico'
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: '¡Registro exitoso!',
      detail: 'Tu cuenta fue creada. Redirigiendo al login...'
    });

    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/login']);
    }, 1500);
  }
}