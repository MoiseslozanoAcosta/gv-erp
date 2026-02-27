import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, RouterLink, ToastModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private messageService: MessageService) {
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
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    if (edad < 18) return { menorEdad: true };
    return null;
  }

  validarPasswordsIguales(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { noCoincide: true };
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.messageService.add({
        severity: 'success',
        summary: 'Registro Exitoso',
        detail: 'Usuario registrado correctamente en ERP'
      });
      console.log('Datos del registro:', this.registerForm.value);
    }
  }
}