import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { isString } from 'util';
import * as _ from 'lodash';

import {
  UiSnackService,
  GameSocketService,
  UserService,
  MessageDataType,
} from '../../share-services';
import { Scene } from './classes/scene';
import { IUser, GameInfo, GameState } from '../../share-services/models/game-info.dto';


@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements OnInit, OnDestroy {

  public isLoading = true;
  public user: IUser = null;
  public game: GameInfo;
  public gameId: string;

  private onGamerJoined$: Subscription;
  private onGamerLeaved$: Subscription;

  constructor(
    protected route: ActivatedRoute,
    private gameSocket: GameSocketService,
    private userService: UserService,
    private uiSnack: UiSnackService,
    private router: Router,
    private dialog: MatDialog
  ) { }


  ngOnInit() {
    const init$ = this.Init().subscribe(
      (gameInfo) => {
        this.startHandlers();
        this.game = new GameInfo(gameInfo);
        this.gameId = gameInfo.id;
        this.isLoading = false;
        setTimeout(() => { const scene = new Scene('#scene', '#map'); }, 0);
      },
      (error) => {
        this.handleError(error, 'Вы покинули игру', 'info');
        this.router.navigate( [`/app/games`] );
      },
      () => init$.unsubscribe()
    );
  }

  private Init() {
    this.isLoading = true;
    return this.route.paramMap.pipe(
      switchMap((paramMap) => {
        this.gameId = paramMap.get('gameId');
        this.user = this.userService.getSession();
        return this.gameSocket.JoinGame({ gameId: this.gameId });
      })
    );
  }

  public ngOnDestroy() {
    const finish$ = this.gameSocket.LeaveGame({gameId: this.gameId}).subscribe(
      () => {
        this.uiSnack.showMessage({
          title: 'Вы покинули игру',
          message: `${this.game.Name}`,
          type: 'info'
        });
      },
      err => {
        console.warn(err);
      },
      () => finish$.unsubscribe()
    );

    if (this.onGamerJoined$) { this.onGamerJoined$.unsubscribe(); }
    if (this.onGamerLeaved$) { this.onGamerLeaved$.unsubscribe(); }
  }

  public startHandlers() {
    this.onGamerJoined$ = this.gameSocket.onGamerJoined()
      .subscribe(user => this.OnGamerJoined(user));

    this.onGamerLeaved$ = this.gameSocket.onGamerLeaved()
      .subscribe(user => this.OnGamerLeaved(user));
  }

  // Handlers
  private OnGamerJoined(user: IUser) {
    this.uiSnack.showMessage({
      title: 'Присоединился новый игрок',
      message: `${user.name}`,
      type: 'info'
    });
    this.game.joinUser(user);
  }

  private OnGamerLeaved(user: IUser) {
    this.uiSnack.showMessage({
      title: 'Игрок покинул игру',
      message: `${user.name}`,
      type: 'info'
    });
    this.game.leaveUser(user);
  }

  private handleError(err: string | Error, title = 'Ошибка', type: MessageDataType = 'warn') {
    this.uiSnack.showMessage({
      title, type,
      message: isString(err) ? err as string : (err as Error).message,
    });
  }
}
