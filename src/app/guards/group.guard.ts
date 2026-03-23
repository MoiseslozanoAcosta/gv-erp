import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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