// Angular
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// 3rd party modules
import { AuthServiceConfig } from './auth.types';
import { UserService } from './user.service';

@Injectable()
export class NoAuthGuard implements CanActivate {

  /**
   * Конструктор
   * @param router Сервис роутинга
   * @param userService Сервис авторизации
   */
  constructor(
    private router: Router,
    private userService: UserService,
    public config: AuthServiceConfig
  ) { }

  /**
   * Функция вызывается при построении роутинга
   * В случае если пользователь авторизован, происходит редирект на главную страницу
   * @param route Запрашиваемый роут
   * @param state Запрашиваемое состояние
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.userService.isAuthenticated()) {
      this.userService.restoreState();
    }
    return !this.userService.isAuthenticated();
  }
}
