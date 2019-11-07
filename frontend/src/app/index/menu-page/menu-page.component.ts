import { Component, OnInit } from '@angular/core';
import { UserService, IUser } from './../../share-services';
import { PushService } from '../../share-services/push.service';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu-page.component.html',
  styleUrls: ['./menu-page.component.scss']
})
export class MenuPageComponent implements OnInit {

  public user: IUser = null;
  public isBusy = false;
  public menuState = 0;

  constructor(
    private userApi: UserService,
    // private pushApi: PushService
  ) { }

  ngOnInit() {
    this.user = this.userApi.getSession();
    // this.pushApi.subscribeToNotifications();
    // this.pushApi.handleActions();
  }

  async logout() {
    await this.userApi.logout();
  }

  openMenuOption(state: number) {
    this.menuState = state;
  }

}
