import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenService } from '../services/token.service';

export const customerGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!tokenService.isCustomer()) {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  return true;
};