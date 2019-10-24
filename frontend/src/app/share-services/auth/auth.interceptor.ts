import { UserService } from './user.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(protected userService: UserService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // request = request.clone({
    //   setHeaders: this.authService.httpAuthHeaders
    // });
    return next.handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleUnauthorizedErrorResponse(error))
      );
  }

  handleUnauthorizedErrorResponse(error: HttpErrorResponse) {
    if ((error.status === 401)) {
      this.userService.logout();
      return throwError(error);
    }
    return throwError(error);
  }
}
