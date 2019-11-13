import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { isString } from 'util';

import {
  UiSnackService,
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
  IGameEventTakeUnitData,
  GameState,
  IGameEventCastleUnitsChangeData,
  randomizer,
  Bot
} from '../../share-services';
import { Scene } from '../game-page/classes/scene';
import { DialogCaptureComponent } from '../game-page/components/dialog-capture/dialog-capture.component';
import { DialogAttackCastleComponent } from '../game-page/components/dialog-attack-castle/dialog-attack-castle.component';
import { DialogAttackUserComponent } from '../game-page/components/dialog-attack-user/dialog-attack-user.component';
import { DialogDefenseComponent } from '../game-page/components/dialog-defense/dialog-defense.component';
import { DialogCastleUnitsChangeComponent } from '../game-page/components/dialog-castle-units-change/dialog-castle-units-change.component';
import {
  DialogBattleResultComponent,
  IDialogBattleResultComponentData
} from '../game-page/components/dialog-battle-result/dialog-battle-result.component';

export interface IHelpInfo {
  massage: string;
  arrowTo?: string;
  hasNext: boolean;
}

@Component({
  selector: 'app-offline-game-page',
  templateUrl: './offline-game-page.component.html',
  styleUrls: ['./offline-game-page.component.scss']
})
export class OfflineGamePageComponent implements OnInit {

  public isLoading = true;
  public user: IUser = null;
  public bots: Map<string, Bot> = new Map();
  public botsCount = 0;
  public game: GameInfo;
  public gameId: string;
  public tileEvents: IGameEvent[];
  public takeUnitEvent: IGameEvent;
  public castleUnitsChangeEvent: IGameEvent;

  public typesRus = {
    chooseTile: 'Выбор места',
    move: 'Передвижение',
    capture: 'Захват замка',
    attackCastle: 'Нападение на замок',
    attackUser: 'Нападение на игрока',
    defense: 'Защита',
    takeUnit: 'Получение юнита',
    castleUnitsChange: 'Изменение обороны замка'
  };

  public isHelp = false;
  public isHelpShow = false;
  public helpState = 0;
  public helpStateMap: Map<number, IHelpInfo> = new Map([
    [0, { massage: 'Добро пожаловать в обучение!', arrowTo: '', hasNext: true }],
    [1, { massage: 'Это поле боя, тут будут проходить большинство ваших действий. На нём вы можете встретить поля, замки и других игроков.', arrowTo: 'map', hasNext: true }],
    [2, { massage: 'Это список участнико боя. В списке можно увидеть, какой цвет принадлежит какому игроку, а также во время игры будет отображаться сколько замков захвачено.', arrowTo: 'user_list', hasNext: true }],
    [3, { massage: 'Это основная информация об игре. Тут отображены действующие бонусы, количество уже найденых карт "Темный век", а также колода с картами эпох.', arrowTo: 'map_effect', hasNext: true }],
    [4, { massage: 'Каждые четыре хода, будет открываться карта эпохи и менять действующие бонусы.', arrowTo: 'map_effect', hasNext: true }],
    [5, { massage: 'Если количество тёмных веков станет равным трём, то игра прекращается и определяется победитель на основе захваченных замков.', arrowTo: 'map_effect', hasNext: true }],
    [6, { massage: 'Побеждает тот, кто заваевал все замки. В случае если были получены все три карты "Темная эпоха", то победителем становиться тот, кто завоевал наибольшее количество замков.', arrowTo: 'map_effect', hasNext: true }],
    [7, { massage: 'В случае если количество замков одинаковое, то победителем становиться тот, у кого во владении есть замок с значением больше, чем у других с таким же количеством замков.', arrowTo: 'map_effect', hasNext: true }],
    [8, { massage: 'Ну а теперь, даваете начнём! Выберите изначальное расположение вашего войска.', arrowTo: '', hasNext: false }],
    [9, { massage: 'Тепрь ваше войско на поле боя! Что же вы можете делать на нем?', arrowTo: 'map', hasNext: true }],
    [10, { massage: 'Вы можете: Передвинуться на соседнюю клетку, захватить замока, напасть на замок другого игрока или на самого игрока.', arrowTo: 'map', hasNext: true }],
    [11, { massage: 'Если на вас напали, то вам нужно будет защищаться.', arrowTo: 'map', hasNext: false }],
    [12, { massage: 'Если ваше войско находиться в замке, то вы также можете: Усилить войско (Получение юнита) или измененить оборону замка.', arrowTo: 'user_info', hasNext: false }],
  ]);





  get curUser(): IGamer {
    if (this.game && this.game.currentUserId) {
      return this.game.Gamers.get(this.game.currentUserId);
    }
    return null;
  }

  get Gamers() {
    return Array.from(this.game.Gamers).map(g => g[1]);
  }

  constructor(
    protected route: ActivatedRoute,
    private userService: UserService,
    private uiSnack: UiSnackService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    return this.route.queryParamMap.subscribe(
      (queryMap) => {
        this.isHelp = queryMap.has('help');
        this.init();
      }
    );
  }

  init() {
    this.user = this.userService.getSession();
    this.setActiveEvents(true);
    this.game = new GameInfo({
      isFrontend: false,
      backendDTO: {
        hostId: this.user.id,
        name: 'Офлайн',
        size: {height: 6, width: 6},
      }
    });
    this.gameId = this.game.GameId;
    this.game.joinUser(this.user);
    this.setActiveEvents();
    if (this.isHelp) {
      this.addBot();
      this.startGame();
    }
    this.isLoading = false;
    setTimeout(() => { const scene = new Scene('#scene', '#map'); }, 0);
  }

  changeHelpState(helpState?: number) {
    if (this.helpStateMap.has(this.helpState)) {
      if (this.isHelpShow) {
        const helpInfo = this.helpStateMap.get(this.helpState);
        if (helpState) {
          this.helpState = helpState;
        } else {
          this.helpState++;
        }
        this.isHelpShow = helpInfo.hasNext;
      } else {
        this.isHelpShow = true;
      }
    }
  }

  addBot() {
    this.botsCount++;
    const newBot = new Bot(`bot-${this.botsCount}`, `Бот ${this.botsCount}`);
    this.bots.set(newBot.toUser.id, newBot);
    this.game.joinUser(newBot.toUser);
  }

  startGame() {
    this.OnGameStarted(this.game.response);
  }

  async click(event: IGameEvent, bot?: Bot) {
    if (event.data.userId === this.user.id) {
      let dialogComponent = null;
      let dialogData = null;
      switch (event.type) {
        case GameEventType.capture: {
          dialogComponent = DialogCaptureComponent;
          dialogData = { data: event.data };
          break;
        }
        case GameEventType.attackCastle: {
          dialogComponent = DialogAttackCastleComponent;
          const data = event.data as IGameEventAttackCastleData;
          const tile: ITile = this.game.gameMap.tiles[data.to.x][data.to.y];
          dialogData = { data, tile };
          break;
        }
        case GameEventType.attackUser: {
          dialogComponent = DialogAttackUserComponent;
          const data = event.data as IGameEventAttackUserData;
          const tile: ITile = this.game.gameMap.tiles[data.to.x][data.to.y];
          dialogData = { data, tile };
          break;
        }
        case GameEventType.defense: {
          dialogComponent = DialogDefenseComponent;
          const data = event.data as IGameEventAttackUserData;
          const tile: ITile = this.game.gameMap.tiles[data.to.x][data.to.y];
          dialogData = { data, tile };
          break;
        }
        case GameEventType.castleUnitsChange: {
          dialogComponent = DialogCastleUnitsChangeComponent;
          const data = event.data as IGameEventCastleUnitsChangeData;
          const tile: ITile = this.game.gameMap.tiles[data.to.x][data.to.y];
          dialogData = { data, tile };
          break;
        }
        default: {
          break;
        }
      }

      if (dialogComponent) {
        const dialogRef = this.dialog.open(dialogComponent, {
          data: { ...dialogData, effect: this.game.gameMap.effect }
        });
        const result = await dialogRef.afterClosed().toPromise();
        if (result) {
          event.data = result;
        } else {
          return;
        }
      }
    } else {
      // логика бота
      event = bot.changeEventData(event);
    }

    this.OnGameEvent({ event, gameId: this.gameId });
  }

  // Handlers
  private OnGameStarted(data: IGameInfoResponse) {
    this.game.startBackend();
    this.setActiveEvents();
    if (this.isHelp) {
      this.changeHelpState();
    }
  }

  private async OnGameEvent(data: IGameEventRequest) {
    if (this.isHelp && data.event.data.userId === this.user.id) {
      this.eventHelpInfo(data.event);
    }
    await this.uiSnackEvent(data.event);
    this.game.event(data.event);
    setTimeout(() => {
      this.setActiveEvents();
    }, 0);
  }

  private handleError(err: string | Error, title = 'Ошибка', type: MessageDataType = 'error') {
    this.uiSnack.showMessage({
      title, type,
      message: isString(err) ? err as string : (err as Error).message,
    }, { duration: 10000 });
  }

  private setActiveEvents(isInit = false) {
    this.tileEvents = null;
    this.takeUnitEvent = undefined;
    this.castleUnitsChangeEvent = undefined;

    if (!isInit && this.game.State !== GameState.FINISHED) {
      const activeEvents = this.game.getActions(this.user);
      if (activeEvents.length > 0) {
        if (activeEvents.length === 1 && activeEvents[0].type === GameEventType.defense) {
          this.click(activeEvents[0]);
        }
        this.tileEvents = activeEvents.filter(e => e.type !== GameEventType.takeUnit && e.type !== GameEventType.castleUnitsChange);
        this.takeUnitEvent = activeEvents.find(e => e.type === GameEventType.takeUnit);
        this.castleUnitsChangeEvent = activeEvents.find(e => e.type === GameEventType.castleUnitsChange);
      } else {
        setTimeout(() => {
          for (const bot of this.bots.values()) {
            const activeEventsBot = this.game.getActions(bot.toUser);
            if (activeEventsBot.length > 0) {
              const event = bot.selectEvent(activeEventsBot, this.game.gameMap.tiles);
              this.click(event, bot);
              return;
            }
          }
        }, randomizer(500, 1500));
      }
    }
  }

  getCastleCount(id: string): string {
    if (this.game.State === GameState.WAITING) {
      return '';
    }
    const user = this.game.gameMap.gameUsers.get(id);
    if (user) {
      return `${user.castleCount}`;
    }
    return '';
  }

  private eventHelpInfo(event: IGameEvent): any {
    switch (event.type) {
      case GameEventType.chooseTile: {
        return this.changeHelpState();
      }
      case GameEventType.capture: {
        return this.changeHelpState();
      }
    }
  }

  private async uiSnackEvent(event: IGameEvent) {
    switch (event.type) {
      case GameEventType.chooseTile: {
          return await this.uiSnackEventChooseTile(event.data as IGameEventChooseTileData);
      }
      case GameEventType.move: {
          return await this.uiSnackEventMove(event.data as IGameEventMoveData);
      }
      case GameEventType.capture: {
          return await this.uiSnackEventCapture(event.data as IGameEventCaptureData);
      }
      case GameEventType.attackCastle: {
          return await this.uiSnackEventAttackCastle(event.data as IGameEventAttackCastleData);
      }
      case GameEventType.attackUser: {
          return await this.uiSnackEventAttackUser(event.data as IGameEventAttackUserData);
      }
      case GameEventType.defense: {
          return await this.uiSnackEventDefense(event.data as IGameEventDefenseData);
      }
      case GameEventType.takeUnit: {
          return await this.uiSnackEventTakeUnit(event.data as IGameEventTakeUnitData);
      }
      case GameEventType.castleUnitsChange: {
          return await this.uiSnackEventCastleUnitsChange(event.data as IGameEventCastleUnitsChangeData);
      }
    }
  }

  async uiSnackEventChooseTile(data: IGameEventChooseTileData) {
    const user = this.game.Gamers.get(data.userId);
    // this.uiSnack.showMessage({
    //   title: `Игрок ${user.name}`,
    //   message: `Выбрал стартовую позицию`,
    //   type: 'success'
    // });
    return true;
  }
  async uiSnackEventMove(data: IGameEventMoveData) {
    const user = this.game.Gamers.get(data.userId);
    // this.uiSnack.showMessage({
    //   title: `Игрок ${user.name}`,
    //   message: `Переместился`,
    //   type: 'success'
    // });
    return true;
  }
  async uiSnackEventCapture(data: IGameEventCaptureData) {
    const user = this.game.Gamers.get(data.userId);
    // this.uiSnack.showMessage({
    //   title: `Игрок ${user.name}`,
    //   message: `Захватил замок`,
    //   type: 'success'
    // });
    return true;
  }
  async uiSnackEventAttackCastle(data: IGameEventAttackCastleData) {
    const attackUser = this.game.Gamers.get(data.userId);
    const tile: ITile = this.game.gameMap.tiles[data.to.x][data.to.y];
    const defenseUser = this.game.Gamers.get(tile.castleInfo.userId);
    const battle = this.game.gameMap.getBattleResult(data.units, tile.castleInfo.units);

    if (this.user.id === attackUser.id || this.user.id === defenseUser.id) {
      const dialogData: IDialogBattleResultComponentData = {
        battle, attackUser, defenseUser,
        effect: this.game.gameMap.effect
      };
      const dialogRef = this.dialog.open(DialogBattleResultComponent, { data: dialogData });
      await dialogRef.afterClosed().toPromise();
    } else {
      // this.uiSnack.showMessage({
      //   title: 'Нападение на замок',
      //   message: battle.isWin ? `Игрок ${attackUser.name} захватил замок` : `Игрок ${attackUser.name} проиграл при захвате`,
      //   type: battle.isWin ? 'success' : 'warn'
      // });
    }
    return true;
  }
  async uiSnackEventAttackUser(data: IGameEventAttackUserData) {
    const attackUser = this.game.Gamers.get(data.userId);
    const defenseUser = this.game.Gamers.get(data.attackedUserId);
    // this.uiSnack.showMessage({
    //   title: `Игрок ${attackUser.name}`,
    //   message: `Совершает атаку на ${defenseUser.name}`,
    //   type: 'info'
    // }, { duration: 1500 });
    return true;
  }
  async uiSnackEventDefense(data: IGameEventDefenseData) {
    const attackUser = this.game.Gamers.get(data.attackUserId);
    const defenseUser = this.game.Gamers.get(data.userId);
    const battle = this.game.gameMap.getBattleResult(data.attackUnits, data.units);

    if (this.user.id === attackUser.id || this.user.id === defenseUser.id) {
      const dialogData: IDialogBattleResultComponentData = {
        battle, attackUser, defenseUser,
        effect: this.game.gameMap.effect
      };
      const dialogRef = this.dialog.open(DialogBattleResultComponent, { data: dialogData });
      await dialogRef.afterClosed().toPromise();
    } else {
      // this.uiSnack.showMessage({
      //   title: `Нападение на ${defenseUser.name}`,
      //   message: battle.isWin ? `Игрок ${attackUser.name} победил` : `Игрок ${attackUser.name} проиграл`,
      //   type: battle.isWin ? 'success' : 'warn'
      // });
    }
    return true;
  }
  async uiSnackEventTakeUnit(data: IGameEventTakeUnitData) {
    const user = this.game.Gamers.get(data.userId);
    // this.uiSnack.showMessage({
    //   title: `Игрок ${user.name}`,
    //   message: `Усилил армию`,
    //   type: 'success'
    // }, { duration: 1500 });
    return true;
  }
  async uiSnackEventCastleUnitsChange(data: IGameEventCastleUnitsChangeData) {
    const user = this.game.Gamers.get(data.userId);
    // this.uiSnack.showMessage({
    //   title: `Игрок ${user.name}`,
    //   message: `Изменил оборону замка`,
    //   type: 'success'
    // }, { duration: 1500 });
    return true;
  }
}
