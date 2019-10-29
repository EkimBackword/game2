import { Component, OnInit, Input } from '@angular/core';
import { IUser, IGameUser } from '../../../../share-services';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  public userInfo: IGameUser = null;

  @Input('users')
  set users(gameUsers: Map<string, IGameUser>) {
    const user: IUser = JSON.parse(localStorage.getItem('user'));
    this.userInfo = gameUsers.get(user.id);
  }

  constructor() { }

  ngOnInit() { }

}
