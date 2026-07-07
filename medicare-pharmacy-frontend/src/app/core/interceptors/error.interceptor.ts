import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Có lỗi xảy ra. Vui lòng thử lại.';

      if (error.error?.message) {
        message = error.error.message;
      }

      if (error.error?.errors?.length > 0) {
        message = error.error.errors.join('\n');
      }

      return throwError(() => ({
        status: error.status,
        message,
        raw: error
      }));
    })
  );
};