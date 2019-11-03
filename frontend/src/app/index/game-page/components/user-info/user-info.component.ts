import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IUser, IGameUser, IGameEvent, IEffect } from '../../../../share-services';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  @Input() users: Map<string, IGameUser>;
  @Input() effect: IEffect;
  @Input() takeUnitEvent: IGameEvent;
  @Input() castleUnitsChangeEvent: IGameEvent;
  @Output() atEvent = new EventEmitter<IGameEvent>();

  get userInfo(): IGameUser {
    if (this.users) {
      const user: IUser = JSON.parse(localStorage.getItem('user'));
      return this.users.get(user.id);
    } else {
      return null;
    }
  }

  get user(): IUser {
    return JSON.parse(localStorage.getItem('user'));
  }

  constructor() { }

  ngOnInit() { }

}
