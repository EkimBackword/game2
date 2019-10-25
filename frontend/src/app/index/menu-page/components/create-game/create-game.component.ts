import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { GameSocketService } from '../../../../share-services';
import { Router } from '@angular/router';
import { IUser } from '../../../../share-services/models/game-info.dto';
import { ICreateGameRequest } from '../../../../share-services/models/gateway.model';
import { ISize } from '../../../../share-services/models/game-map.model';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.scss']
})
export class CreateGameComponent implements OnInit {

  @Input() public host: IUser;
  @Output() openMenuOption = new EventEmitter<number>();

  public data: ICreateGameRequest = { name: '', size: null };
  public maps: {display: string, size: ISize}[] = [
    { display: 'Размером 6 на 6', size: { height: 6, width: 6}},
    { display: 'Размером 9 на 9', size: { height: 9, width: 9}},
  ];

  constructor(
    private gameSocket: GameSocketService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.data.size = this.maps[0].size;
  }

  create() {
    this.gameSocket.CreateGame(this.data).subscribe(
      gameInfo => {
        this.router.navigate( [`/app/games/${gameInfo.id}`] );
      }
    );
  }

}
