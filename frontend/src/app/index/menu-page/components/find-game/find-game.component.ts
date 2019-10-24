import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GameSocketService } from '../../../../share-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-find-game',
  templateUrl: './find-game.component.html',
  styleUrls: ['./find-game.component.scss']
})
export class FindGameComponent implements OnInit {

  @Output() openMenuOption = new EventEmitter<number>();
  public games = new Map<string, any>();

  constructor(
    private gameSocket: GameSocketService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.gameSocket.GetGames().subscribe(games => {
      this.games = games;
    });
  }

  join(id: string) {
    this.router.navigate( [`/app/games/${id}`] );
  }

}
