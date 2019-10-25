import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map, first } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { isString } from 'util';
import { UserService } from '../auth';
import { ICreateGameRequest, IGameRequest } from '../models/gateway.model';
import { IGameInfoResponse, IUser, GameInfo } from '../models/game-info.dto';

@Injectable({
  providedIn: 'root'
})
export class GameSocket extends Socket {
  constructor(protected userService: UserService) {
      super({ url: '/games', options: { query: userService.getSession() }});
  }
}

@Injectable({
  providedIn: 'root'
})
export class GameSocketService {

  private joinGameReq: IGameRequest = null;

  constructor(private socket: GameSocket) {
    socket.on('reconnect', () => {
      if (this.joinGameReq !== null) {
        const sub$ = this.JoinGame(this.joinGameReq).subscribe(
          () => { },
          () => { },
          () => { sub$.unsubscribe(); }
        );
      }
    });
  }

  private mapResponse<T>(success: Observable<T>, error: Observable<string>) {
    return merge(success, error) .pipe(first(), map((data) => {
      if (isString(data)) { throw new Error(data as string); }
      return data as T;
    }));
  }

  //#region GetGames
  GetGames() {
    this.socket.emit('GetGames', {});
    return this.onGetGamesSuccess();
  }
  private onGetGamesSuccess() {
    return this.socket.fromEvent<IGameInfoResponse[]>('GetGamesSuccess');
  }
  //#endregion GetGames



  //#region GetMaps
  GetGameData(req: any) {
    this.socket.emit('GetGameData', req);
    return this.mapResponse<any>(this.onGetGameDataSuccess(), this.onGetGameDataError());
  }
  private onGetGameDataSuccess() {
    return this.socket.fromEvent<any>('GetGameDataSuccess');
  }
  private onGetGameDataError() {
    return this.socket.fromEvent<string>('GetGameDataError');
  }
  //#endregion GetMaps




  //#region CreateGame
  CreateGame(req: ICreateGameRequest) {
    this.socket.emit('CreateGame', req);
    return this.mapResponse<IGameInfoResponse>(this.onCreateGameSuccess(), this.onCreateGameError());
  }
  private onCreateGameSuccess() {
    return this.socket.fromEvent<IGameInfoResponse>('CreateGameSuccess');
  }
  private onCreateGameError() {
    return this.socket.fromEvent<string>('CreateGameError');
  }
  onNewGameAdded() {
    return this.socket.fromEvent<IGameInfoResponse>('NewGameAdded');
  }
  //#endregion CreateGame



  //#region JoinGame
  JoinGame(req: IGameRequest) {
    this.joinGameReq = req;
    this.socket.emit('JoinGame', req);
    return this.mapResponse<IGameInfoResponse>(this.onJoinGameSuccess(), this.onJoinGameError());
  }
  private onJoinGameSuccess() {
    return this.socket.fromEvent<IGameInfoResponse>('JoinGameSuccess');
  }
  private onJoinGameError() {
    return this.socket.fromEvent<string>('JoinGameError');
  }
  onGamerJoined() {
    return this.socket.fromEvent<IUser>('GamerJoined');
  }
  //#endregion JoinGame



  //#region LeaveGame
  LeaveGame(req: IGameRequest) {
    this.joinGameReq = null;
    this.socket.emit('LeaveGame', req);
    return this.mapResponse<boolean>(this.onLeaveSuccess(), this.onLeaveError());
  }
  private onLeaveSuccess() {
    return this.socket.fromEvent<boolean>('LeaveGameSuccess');
  }
  private onLeaveError() {
    return this.socket.fromEvent<string>('LeaveError');
  }
  onGamerLeaved() {
    return this.socket.fromEvent<IUser>('GamerLeaved');
  }
  //#endregion LeaveGame


  //#region LeaveGame
  StartGame(req: IGameRequest) {
    this.joinGameReq = null;
    this.socket.emit('StartGame', req);
    return this.mapResponse<IGameInfoResponse>(this.onStartGameSuccess(), this.onStartGameError());
  }
  private onStartGameSuccess() {
    return this.socket.fromEvent<IGameInfoResponse>('StartGameSuccess');
  }
  private onStartGameError() {
    return this.socket.fromEvent<string>('StartGameError');
  }
  onGameStarted() {
    return this.socket.fromEvent<IGameInfoResponse>('GameStarted');
  }
  //#endregion LeaveGame

}
