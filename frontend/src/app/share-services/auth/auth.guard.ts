// Angular
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// 3rd party modules
import { AuthServiceConfig } from './auth.types';
import { UserService } from './user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * Конструктор
   * @param router Сервис роутинга
   * @param authService Сервис авторизации
   */
  constructor(
    private router: Router,
    private userService: UserService,
    public config: AuthServiceConfig
  ) { }

  /**
   * Функция вызывается при построении роутинга
   * В случае если пользователь не авторизован, происходит редирект на страницу авторизации
   * @param route Запрашиваемый роут
   * @param state Запрашиваемое состояние
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.userService.isAuthenticated()) {
      this.userService.saveState();
      this.router.navigateByUrl(this.config.defaultUnauthorizedUrn);
    }
    return this.userService.isAuthenticated();
  }
}
