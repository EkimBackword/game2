import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GameSocketService } from '../../../../share-services';
import { Router } from '@angular/router';
import { IGameInfoResponse } from '../../../../share-services/models/game-info.dto';

@Component({
  selector: 'app-find-game',
  templateUrl: './find-game.component.html',
  styleUrls: ['./find-game.component.scss']
})
export class FindGameComponent implements OnInit {

  @Output() openMenuOption = new EventEmitter<number>();
  public games: IGameInfoResponse[] = [];
  public isLoading = true;


  constructor(
    private gameSocket: GameSocketService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.isLoading = true;
    this.gameSocket.GetGames().subscribe(
      (games) => {
        this.games = games;
      },
      err => {
        console.warn(err);
      },
      () => {
        this.isLoading = false;
      }
    );

    this.gameSocket.onNewGameAdded().subscribe(
      (game) => {
        this.games.push(game);
      },
      err => {
        console.warn(err);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  join(id: string) {
    this.router.navigate( [`/app/games/${id}`] );
  }

}
