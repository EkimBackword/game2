import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subscription, Observable } from 'rxjs';
import { switchMap, filter, share } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { isString } from 'util';
import * as _ from 'lodash';

import {
  UiSnackService,
  GameSocketService,
  IUser,
  UserService,
} from '../../share-services';
import { Scene } from './classes/scene';


@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements OnInit, OnDestroy {

  public gameId: string;
  public isLoading = true;
  public user: IUser = null;

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
    const init$ = this.Init().subscribe((game) => {
      this.startHandlers();
      // TODO: this.SetGameData(game);
      this.isLoading = false;
      setTimeout(() => {
        const scene = new Scene('#scene', '#map');
      }, 0);
    }, (error) => {
      this.uiSnack.showMessage({
        title: 'Вы покинули игру',
        message: `${error}`,
        type: 'info'
      });
      this.router.navigate( [`/app/games`] );
    }, () => init$.unsubscribe());
  }

  public ngOnDestroy() {
    const finish$ = this.gameSocket.LeaveGame(this.gameId).subscribe(() => {
      this.uiSnack.showMessage({
        title: 'Вы покинули игру',
        message: ``,
        type: 'info'
      });
      finish$.unsubscribe();
    });

    if (this.onGamerJoined$) { this.onGamerJoined$.unsubscribe(); }
    if (this.onGamerLeaved$) { this.onGamerLeaved$.unsubscribe(); }
  }

  public startHandlers() {
    this.onGamerJoined$ = this.gameSocket.onGamerJoined()
      .subscribe(user => this.OnGamerJoined(user));

    this.onGamerLeaved$ = this.gameSocket.onGamerLeaved()
      .subscribe(user => this.OnGamerLeaved(user));
  }

  private Init() {
    return this.route.paramMap.pipe(
      switchMap((paramMap) => {
        this.gameId = paramMap.get('gameId');
        this.user = this.userService.getSession();
        return this.gameSocket.JoinGame({ gameId: this.gameId });
        // TODO: GetGameData in JoinGame
      })
    );
  }


  private OnGamerJoined(user: IUser) {
    this.uiSnack.showMessage({
      title: 'Присоединился новый игрок',
      message: `${user.name}`,
      type: 'info'
    });
  }

  private OnGamerLeaved(user: IUser) {
    this.uiSnack.showMessage({
      title: 'Игрок покинул игру',
      message: `${user.name}`,
      type: 'info'
    });
  }

  private handleError(err: string | Error) {
    this.uiSnack.showMessage({
      title: 'Ошибка',
      message: isString(err) ? err as string : (err as Error).message,
      type: 'warn'
    });
  }
}
