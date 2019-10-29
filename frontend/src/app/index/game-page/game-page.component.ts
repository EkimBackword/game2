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
import { IUser, GameInfo, GameState, IGameInfoResponse } from '../../share-services/models/game-info.dto';
import { IGameEvent, GameEventType } from '../../share-services/models/game-event.model';
import { IGameEventRequest } from '../../share-services/models/gateway.model';


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

  public tileEvents: IGameEvent[];
  public hasTakeUnitEvent: boolean;

  private subscriptions: Map<string, Subscription>;

  constructor(
    protected route: ActivatedRoute,
    private gameSocket: GameSocketService,
    private userService: UserService,
    private uiSnack: UiSnackService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.subscriptions = new Map();
    this.setActiveEvents(true);
    const init$ = this.Init().subscribe(
      (gameInfo) => {
        this.startHandlers();
        this.game = new GameInfo(gameInfo);
        this.gameId = gameInfo.id;
        this.setActiveEvents();
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

    for (const sub$ of this.subscriptions.values()) {
      sub$.unsubscribe();
    }
  }

  startHandlers() {
    const onGamerJoined$ = this.gameSocket.onGamerJoined()
      .subscribe(user => this.OnGamerJoined(user));
    this.subscriptions.set('onGamerJoined', onGamerJoined$);

    const onGamerLeaved$ = this.gameSocket.onGamerLeaved()
      .subscribe(user => this.OnGamerLeaved(user));
    this.subscriptions.set('onGamerLeaved', onGamerLeaved$);

    const onGameStarted$ = this.gameSocket.onGameStarted()
      .subscribe(user => this.OnGameStarted(user));
    this.subscriptions.set('onGameStarted', onGameStarted$);

    const onGameEvent$ = this.gameSocket.onGameEvent()
      .subscribe(event => this.OnGameEvent(event));
    this.subscriptions.set('onGameEvent', onGameEvent$);
  }

  startGame() {
    const start$ = this.gameSocket.StartGame({ gameId: this.gameId }).subscribe(
      data => this.OnGameStarted(data),
      err => this.handleError(err),
      () => start$.unsubscribe()
    );
  }

  click(event: IGameEvent) {
    // TODO: Некоторые события нужно изменить перед отправкой
    if ([
      GameEventType.capture,
      GameEventType.attackCastle,
      GameEventType.attackUser,
      GameEventType.defense,
      GameEventType.takeUnit,
    ].indexOf(event.type) > -1) {
      console.log('Не отправил', event);
      return;
    }
    const click$ = this.gameSocket.GameEvent({
      event, gameId: this.gameId
    }).subscribe(
      data => { console.log(data, event); },
      err => this.handleError(err),
      () => click$.unsubscribe()
    );
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

  private OnGameStarted(data: IGameInfoResponse) {
    this.game.start(data);
    this.setActiveEvents();
  }

  private OnGameEvent(data: IGameEventRequest) {
    this.game.event(data.event);
    this.setActiveEvents();
  }

  private handleError(err: string | Error, title = 'Ошибка', type: MessageDataType = 'warn') {
    this.uiSnack.showMessage({
      title, type,
      message: isString(err) ? err as string : (err as Error).message,
    });
  }

  private setActiveEvents(isInit = false) {
    this.tileEvents = null;
    this.hasTakeUnitEvent = false;
    if (!isInit) {
      const activeEvents = this.game.getActions(this.user);
      this.tileEvents = activeEvents.filter(e => e.type !== GameEventType.takeUnit);
      this.hasTakeUnitEvent = activeEvents.some(e => e.type === GameEventType.takeUnit);
    }
  }
}
