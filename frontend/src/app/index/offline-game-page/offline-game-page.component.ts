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
    this.user = this.userService.getSession();
    this.bots.set('bot-2', new Bot('bot-2', 'Бот 2'));
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
    this.isLoading = false;
    setTimeout(() => { const scene = new Scene('#scene', '#map'); }, 0);
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
  }

  private OnGameEvent(data: IGameEventRequest) {
    this.uiSnackEvent(data.event);
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
      case GameEventType.castleUnitsChange: {
          return this.uiSnackEventCastleUnitsChange(event.data as IGameEventCastleUnitsChangeData);
      }
    }
  }

  uiSnackEventChooseTile(data: IGameEventChooseTileData) {
    const user = this.game.Gamers.get(data.userId);
    this.uiSnack.showMessage({
      title: `Игрок ${user.name}`,
      message: `Выбрал стартовую позицию`,
      type: 'success'
    });
  }
  uiSnackEventMove(data: IGameEventMoveData) {
    const user = this.game.Gamers.get(data.userId);
    this.uiSnack.showMessage({
      title: `Игрок ${user.name}`,
      message: `Переместился`,
      type: 'success'
    });
  }
  uiSnackEventCapture(data: IGameEventCaptureData) {
    const user = this.game.Gamers.get(data.userId);
    this.uiSnack.showMessage({
      title: `Игрок ${user.name}`,
      message: `Захватил замок`,
      type: 'success'
    });
  }
  uiSnackEventAttackCastle(data: IGameEventAttackCastleData) {
    const attackUser = this.game.Gamers.get(data.userId);
    const tile: ITile = this.game.gameMap.tiles[data.to.x][data.to.y];
    const defenseUser = this.game.Gamers.get(tile.castleInfo.userId);
    const battle = this.game.gameMap.getBattleResult(data.units, tile.castleInfo.units);

    if (this.user.id === attackUser.id || this.user.id === defenseUser.id) {
      const dialogData: IDialogBattleResultComponentData = {
        battle, attackUser, defenseUser,
        effect: this.game.gameMap.effect
      };
      this.dialog.open(DialogBattleResultComponent, { data: dialogData });
    } else {
      this.uiSnack.showMessage({
        title: 'Нападение на замок',
        message: battle.isWin ? `Игрок ${attackUser.name} захватил замок` : `Игрок ${attackUser.name} проиграл при захвате`,
        type: battle.isWin ? 'success' : 'warn'
      });
    }

  }
  uiSnackEventAttackUser(data: IGameEventAttackUserData) {
    const attackUser = this.game.Gamers.get(data.userId);
    const defenseUser = this.game.Gamers.get(data.attackedUserId);
    this.uiSnack.showMessage({
      title: `Игрок ${attackUser.name}`,
      message: `Совершает атаку на ${defenseUser.name}`,
      type: 'info'
    }, { duration: 1500 });
  }
  uiSnackEventDefense(data: IGameEventDefenseData) {
    const attackUser = this.game.Gamers.get(data.attackUserId);
    const defenseUser = this.game.Gamers.get(data.userId);
    const battle = this.game.gameMap.getBattleResult(data.attackUnits, data.units);

    if (this.user.id === attackUser.id || this.user.id === defenseUser.id) {
      const dialogData: IDialogBattleResultComponentData = {
        battle, attackUser, defenseUser,
        effect: this.game.gameMap.effect
      };
      this.dialog.open(DialogBattleResultComponent, { data: dialogData });
    } else {
      this.uiSnack.showMessage({
        title: `Нападение на ${defenseUser.name}`,
        message: battle.isWin ? `Игрок ${attackUser.name} победил` : `Игрок ${attackUser.name} проиграл`,
        type: battle.isWin ? 'success' : 'warn'
      });
    }

  }
  uiSnackEventTakeUnit(data: IGameEventTakeUnitData) {
    const user = this.game.Gamers.get(data.userId);
    this.uiSnack.showMessage({
      title: `Игрок ${user.name}`,
      message: `Усилил армию`,
      type: 'success'
    }, { duration: 1500 });
  }
  uiSnackEventCastleUnitsChange(data: IGameEventCastleUnitsChangeData) {
    const user = this.game.Gamers.get(data.userId);
    this.uiSnack.showMessage({
      title: `Игрок ${user.name}`,
      message: `Изменил оборону замка`,
      type: 'success'
    }, { duration: 1500 });
  }
}
