import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { GameSocketService, IUser } from '../../../../share-services';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.scss']
})
export class CreateGameComponent implements OnInit {

  @Input() public host: IUser;
  @Output() openMenuOption = new EventEmitter<number>();

  public data: any = { name: '', hostId: '', mapId: 'Не выбран' };
  public maps$: Observable<any[]>;

  constructor(
    private gameSocket: GameSocketService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.gameSocket.GetMaps()
      .subscribe(
        (maps) => { this.maps$ = of(maps); },
        (error) => { console.warn(error); }
      );
  }

  create() {
    this.gameSocket.CreateGame({
      name: this.data.name,
      hostId: this.host.id,
      mapId: this.data.mapId
    }).subscribe(gameInfo => {
      this.router.navigate( [`/app/games/${gameInfo.id}`] );
    });
  }

}
