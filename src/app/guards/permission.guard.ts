import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as string;

  if (!auth.currentUser()) {
    router.navigate(['/login']);
    return false;
  }

  if (!auth.hasPermission(requiredPermission)) {
    router.navigate(['/dashboard']); // o una página de "sin acceso"
    return false;
  }

  return true;
};