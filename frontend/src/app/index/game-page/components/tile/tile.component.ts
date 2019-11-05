import { Component, OnInit, Input } from '@angular/core';
import { ITile, IUser, UserService } from '../../../../share-services';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {

  @Input() tile: ITile;
  public user: IUser = null;

  constructor(private userApi: UserService) { }

  ngOnInit() {
    this.user = this.userApi.getSession();
  }

  get visible() {
    return this.tile.visibleFor.indexOf(this.user.id) > -1;
  }

  get type() {
    return this.tile.isCastle ?
    (this.tile.castleInfo.userId === null ? 'castle' : 'castle-user')
    : 'grass';
  }

  get userColor() {
    return this.tile.isCastle ? this.tile.castleInfo.color : '';
  }

  get index() {
    return this.tile.isCastle ? this.tile.castleInfo.index : null;
  }

}
