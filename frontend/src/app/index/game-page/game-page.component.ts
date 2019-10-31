import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { isString } from 'util';

import {
  UiSnackService,
  GameSocketService,
  UserService,
  MessageDataType,
  IUser,
  GameInfo,
  IGameInfoResponse,
  IGameEvent,
  GameEventType,
  IGameEventRequest,
  IGamer,
  ITile,
  IGameEventAttackCastleData,
  IGameEventAttackUserData,
  IGameEventChooseTileData,
  IGameEventMoveData,
  IGameEventCaptureData,
  IGameEventDefenseData,
  IGameEventTakeUnitData
} from '../../share-services';
import { Scene } from './classes/scene';
import { DialogCaptureComponent } from './components/dialog-capture/dialog-capture.component';
import { DialogAttackCastleComponent } from './components/dialog-attack-castle/dialog-attack-castle.component';
import { DialogAttackUserComponent } from './components/dialog-attack-user/dialog-attack-user.component';
import { DialogDefenseComponent } from './components/dialog-defense/dialog-defense.component';


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
  public takeUnitEvent: IGameEvent;

  private subscriptions: Map<string, Subscription>;

  private typesRus = {
    chooseTile: 'Выбор места',
    move: 'Передвижение',
    capture: 'Захват замка',
    attackCastle: 'Нападение на замок',
    attackUser: 'Нападение на игрока',
    defense: 'Защита',
    takeUnit: 'Получение юнита'
  };

  get curUser(): IGamer {
    if (this.game && this.game.currentUserId) {
      return this.game.Gamers.get(this.game.currentUserId);
    }
    return null;
  }

  getCastleCount(id: string): number {
    const user = this.game.gameMap.gameUsers.get(id);
    if (user) {
      return user.castleCount;
    }
    return -1;
  }

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
        this.game = new GameInfo({
          isFrontend: true,
          frontendDTO: gameInfo
        });
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

  async click(event: IGameEvent) {
    switch (event.type) {
      case GameEventType.capture: {
        const dialogRef = this.dialog.open(DialogCaptureComponent, { width: '650px', data: event.data });
        const result = await dialogRef.afterClosed().toPromise();
        if (result) { event.data = result; break; }
        return;
      }
      case GameEventType.attackCastle: {
        const data = event.data as IGameEventAttackCastleData;
        const tile: ITile = this.game.gameMap.tiles[data.to.x][data.to.y];
        const dialogRef = this.dialog.open(DialogAttackCastleComponent, { width: '650px', data: { data, tile } });
        const result = await dialogRef.afterClosed().toPromise();
        if (result) { event.data = result; break; }
        return;
      }
      case GameEventType.attackUser: {
        const data = event.data as IGameEventAttackUserData;
        const tile: ITile = this.game.gameMap.tiles[data.to.x][data.to.y];
        const dialogRef = this.dialog.open(DialogAttackUserComponent, { width: '650px', data: { data, tile } });
        const result = await dialogRef.afterClosed().toPromise();
        if (result) { event.data = result; break; }
        return;
      }
      case GameEventType.defense: {
        const data = event.data as IGameEventAttackUserData;
        const tile: ITile = this.game.gameMap.tiles[data.to.x][data.to.y];
        const dialogRef = this.dialog.open(DialogDefenseComponent, { width: '650px', data: { data, tile } });
        const result = await dialogRef.afterClosed().toPromise();
        if (result) { event.data = result; break; }
        return;
      }
      default: {
        break;
      }
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
    this.uiSnackEvent(data.event);
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
    this.takeUnitEvent = undefined;
    if (!isInit) {
      const activeEvents = this.game.getActions(this.user);
      this.tileEvents = activeEvents.filter(e => e.type !== GameEventType.takeUnit);
      this.takeUnitEvent = activeEvents.find(e => e.type === GameEventType.takeUnit);
    }
  }

  private uiSnackEvent(event: IGameEvent): any {
    switch (event.type) {
      case GameEventType.chooseTile: {
          return this.uiSnackEventChooseTile(event.data as IGameEventChooseTileData);
      }
      case GameEventType.move: {
          return this.uiSnackEventMove(event.data as IGameEventMoveData);
      }
      case GameEventType.capture: {
          return this.uiSnackEventCapture(event.data as IGameEventCaptureData);
      }
      case GameEventType.attackCastle: {
          return this.uiSnackEventAttackCastle(event.data as IGameEventAttackCastleData);
      }
      case GameEventType.attackUser: {
          return this.uiSnackEventAttackUser(event.data as IGameEventAttackUserData);
      }
      case GameEventType.defense: {
          return this.uiSnackEventDefense(event.data as IGameEventDefenseData);
      }
      case GameEventType.takeUnit: {
          return this.uiSnackEventTakeUnit(event.data as IGameEventTakeUnitData);
      }
    }
  }

  uiSnackEventChooseTile(data: IGameEventChooseTileData) {
    const user = this.game.Gamers.get(data.userId);
    this.uiSnack.showMessage({
      title: `Игрок ${user.name}`,
      message: `Выбрал стартовую позицию`,
      type: 'success'
    }, { duration: 2000 });
  }
  uiSnackEventMove(data: IGameEventMoveData) {
    const user = this.game.Gamers.get(data.userId);
    this.uiSnack.showMessage({
      title: `Игрок ${user.name}`,
      message: `Переместился`,
      type: 'success'
    }, { duration: 2000 });
  }
  uiSnackEventCapture(data: IGameEventCaptureData) {
    const user = this.game.Gamers.get(data.userId);
    this.uiSnack.showMessage({
      title: `Игрок ${user.name}`,
      message: `Захватил замок`,
      type: 'success'
    }, { duration: 2000 });
  }
  uiSnackEventAttackCastle(data: IGameEventAttackCastleData) {
    const user = this.game.Gamers.get(data.userId);
    const tile: ITile = this.game.gameMap.tiles[data.to.x][data.to.y];
    const defenseUser = this.game.Gamers.get(tile.castleInfo.userId);
    const BattleResult = this.game.gameMap.getBattleResult(data.units, tile.castleInfo.units);
    this.uiSnack.showMessage({
      title: BattleResult.isWin ? `Игрок ${user.name} захватил замок` : `Игрок ${user.name} проиграл при захвате`,
      message: `Счёт: Атака ${user.name} ${BattleResult.attackPower} - ${BattleResult.defensePower} ${defenseUser.name} Защита`,
      type: BattleResult.isWin ? 'success' : 'warn'
    }, { duration: 10000 });
  }
  uiSnackEventAttackUser(data: IGameEventAttackUserData) {
    const attackUser = this.game.Gamers.get(data.userId);
    const defenseUser = this.game.Gamers.get(data.attackedUserId);
    this.uiSnack.showMessage({
      title: `Игрок ${attackUser.name}`,
      message: `Совершает атаку на ${defenseUser.name}`,
      type: 'info'
    }, { duration: 2000 });
  }
  uiSnackEventDefense(data: IGameEventDefenseData) {
    const attackUser = this.game.Gamers.get(data.attackUserId);
    const defenseUser = this.game.Gamers.get(data.userId);
    const BattleResult = this.game.gameMap.getBattleResult(data.attackUnits, data.units);
    this.uiSnack.showMessage({
      title: BattleResult.isWin ? `Игрок ${attackUser.name} победил` : `Игрок ${attackUser.name} проиграл`,
      message: `Счёт: Атака ${attackUser.name} ${BattleResult.attackPower} - ${BattleResult.defensePower} ${defenseUser.name} Защита`,
      type: BattleResult.isWin ? 'success' : 'warn'
    }, { duration: 10000 });
  }
  uiSnackEventTakeUnit(data: IGameEventTakeUnitData) {
    const user = this.game.Gamers.get(data.userId);
    this.uiSnack.showMessage({
      title: `Игрок ${user.name}`,
      message: `Услил армию`,
      type: 'success'
    }, { duration: 2000 });
  }
}
