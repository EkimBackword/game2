import { Component, OnInit } from '@angular/core';
import { UserService } from './../../share-services';
import { IUser } from '../../share-services/models/game-info.dto';

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
    private userApi: UserService
  ) { }

  ngOnInit() {
    this.user = this.userApi.getSession();
  }

  async logout() {
    await this.userApi.logout();
  }

  openMenuOption(state: number) {
    this.menuState = state;
  }

}
