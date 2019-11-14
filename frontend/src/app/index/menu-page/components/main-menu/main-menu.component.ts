import { Component, OnInit, Input, Output, EventEmitter, } from '@angular/core';
import { IUser } from '../../../../share-services';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {

  public isBusy = false;
  @Input() public user: IUser;
  @Input() public isOnline: boolean;
  @Output() logout = new EventEmitter();
  @Output() openMenuOption = new EventEmitter<number>();

  constructor() { }

  ngOnInit() { }

}
