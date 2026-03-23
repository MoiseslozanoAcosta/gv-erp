import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Verifica si el usuario está logueado
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser()) return true;
  router.navigate(['/login']);
  return false;
};

// Verifica si el usuario tiene un grupo seleccionado
export const groupGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.currentUser()) {
    router.navigate(['/login']);
    return false;
  }

  if (!auth.selectedGroup()) {
    router.navigate(['/groups']);
    return false;
  }

  return true;
};

// Verifica permisos específicos antes de entrar a la ruta
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as string;

  if (!auth.currentUser()) {
    router.navigate(['/login']);
    return false;
  }

  // Si es superadmin, pasa automáticamente
  if (auth.isSuperAdmin()) return true;

  if (!auth.hasPermission(requiredPermission)) {
    router.navigate(['/dashboard']); // redirige si no tiene permiso
    return false;
  }

  return true;
};