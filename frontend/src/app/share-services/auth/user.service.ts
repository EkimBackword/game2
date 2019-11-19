import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import * as uuid4 from 'uuid4';

import { AuthServiceConfig } from './auth.types';
import { IUser } from '../models';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, of, concat } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  public checkOnline$: Observable<boolean>;
  private globalPrefix = '/api/v1.0';
  private stateUrl: string = null;

  constructor(
    private router: Router,
    private config: AuthServiceConfig,
    http: HttpClient
  ) {
    if ('onLine' in navigator) {
      const head$ = of(navigator.onLine);
      const interval$ = interval(1000).pipe(switchMap(() => of(navigator.onLine)));
      this.checkOnline$ = concat(head$, interval$);
    } else {
      const head$ = http.head<boolean>(`${this.globalPrefix}/check-online`).pipe(
        map(() => true),
        catchError(() => of(false)),
      );
      const interval$ = interval(1000).pipe(switchMap(() => head$));
      this.checkOnline$ = concat(head$, interval$);
    }
  }

  public async create(name: string) {
    const user: IUser = { id: uuid4(), name };
    localStorage.setItem('user', JSON.stringify(user));
    this.restoreState();
    return user;
  }

  public isAuthenticated() {
    return localStorage.getItem('user') !== null;
  }

  public getSession() {
    const user: IUser = JSON.parse(localStorage.getItem('user'));
    return user;
  }

  public async logout() {
    localStorage.removeItem('user');
    await this.router.navigateByUrl(this.config.defaultUnauthorizedUrn);
    return null;
  }

  saveState() {
    this.stateUrl = window.location.pathname;
  }

  restoreState() {
    if (this.stateUrl === null) {
      this.router.navigateByUrl(this.config.defaultAuthorizedUrn);
    } else {
      const url = JSON.parse(JSON.stringify(this.stateUrl));
      this.stateUrl = null;
      this.router.navigateByUrl(url);
    }
  }

}
