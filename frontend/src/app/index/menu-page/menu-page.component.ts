import { Component, OnInit } from '@angular/core';
import { UserService, IUser, GameSocketService } from './../../share-services';
import { PushService } from '../../share-services/push.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu-page.component.html',
  styleUrls: ['./menu-page.component.scss']
})
export class MenuPageComponent implements OnInit {

  public user: IUser = null;
  public isBusy = false;
  public menuState = 0;
  public isOnline: boolean;

  public appVersionFull = environment.versionFull;
  public appVersion = environment.version;

  constructor(
    private userApi: UserService,
    private gameSocket: GameSocketService,
  ) { }

  ngOnInit() {
    this.user = this.userApi.getSession();
    this.userApi.checkOnline$.subscribe(
      flag => { this.isOnline = flag; }
    );
  }

  async logout() {
    console.warn('logout & delete PushSubscriber');
    this.gameSocket.DeletePushSubscriber({}).subscribe(
      () => {},
      () => {},
      async () => { await this.userApi.logout(); },
    );
  }

  openMenuOption(state: number) {
    this.menuState = state;
  }

}
