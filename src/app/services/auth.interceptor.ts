import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isApiRequest = req.url.includes('/api') || req.url.startsWith(environment.apiUrl);

  let headers = req.headers;

  // Para envíos multipart/form-data (subida de fotos físicas y multimedia),
  // asegurar que no se fuerce un Content-Type manual para que el navegador
  // configure automáticamente 'multipart/form-data; boundary=----WebKitFormBoundary...'
  if (req.body instanceof FormData && headers.has('Content-Type')) {
    headers = headers.delete('Content-Type');
  }

  // Inyectar Bearer token para endpoints de API cuando exista token válido
  if (token && isApiRequest) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const modifiedReq = req.clone({ headers });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si la API responde 401 (token expirado o inválido), limpiar credenciales
      if (error.status === 401 && isApiRequest && !req.url.includes('/auth/login')) {
        console.warn('Petición no autorizada (401). Limpiando credenciales expiradas o inválidas.');
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
