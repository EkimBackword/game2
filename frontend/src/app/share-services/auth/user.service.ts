import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import * as uuid4 from 'uuid4';

import { AuthServiceConfig } from './auth.types';
import { IUser } from '../models';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private router: Router,
    private config: AuthServiceConfig
  ) { }

  public async create(name: string) {
    const user: IUser = { id: uuid4(), name };
    localStorage.setItem('user', JSON.stringify(user));
    await this.router.navigateByUrl(this.config.defaultAuthorizedUrn);
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

}
