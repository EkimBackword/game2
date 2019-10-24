import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map, first } from 'rxjs/operators';
import { merge } from 'rxjs';
import { isString } from 'util';
import { UserService } from '../auth';

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

  private joinGameReq: any = null;

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

  //#region GetGames
  GetGames() {
    this.socket.emit('GetGames', {});
    return this.onGetGamesSuccess();
  }
  private onGetGamesSuccess() {
    return this.socket.fromOneTimeEvent<any[]>('GetGamesSuccess');
  }
  //#endregion GetGames



  //#region GetMaps
  GetGameData(req: any) {
    this.socket.emit('GetGameData', req);
    return merge(this.onGetGameDataSuccess(), this.onGetGameDataError())
    .pipe(first(), map((data) => {
      if (isString(data)) { throw new Error(data as string); }
      return data as any;
    }));
  }
  private onGetGameDataSuccess() {
    return this.socket.fromEvent<any>('GetGameDataSuccess');
  }
  private onGetGameDataError() {
    return this.socket.fromEvent<string>('GetGameDataError');
  }
  //#endregion GetMaps




  //#region CreateGame
  CreateGame(req: any) {
    this.socket.emit('CreateGame', req);
    return merge(this.onCreateGameSuccess(), this.onCreateGameError())
      .pipe(first(), map((data) => {
        if (isString(data)) { throw new Error(data as string); }
        return data as any;
      }));
  }
  private onCreateGameSuccess() {
    return this.socket.fromEvent<any>('CreateGameSuccess');
  }
  private onCreateGameError() {
    return this.socket.fromEvent<string>('CreateGameError');
  }
  onNewGameAdded() {
    return this.socket.fromEvent<any>('NewGameAdded');
  }
  //#endregion CreateGame



  //#region JoinGame
  JoinGame(req: any) {
    this.joinGameReq = req;
    this.socket.emit('JoinGame', req);
    return merge(this.onJoinGameSuccess(), this.onJoinGameError())
    .pipe(first(), map((data) => {
      if (isString(data)) { throw new Error(data as string); }
      return data as any;
    }));
  }
  private onJoinGameSuccess() {
    return this.socket.fromEvent<any>('JoinGameSuccess');
  }
  private onJoinGameError() {
    return this.socket.fromEvent<string>('JoinGameError');
  }
  onGamerJoined() {
    return this.socket.fromEvent<any>('GamerJoined');
  }
  //#endregion JoinGame



  //#region LeaveGame
  LeaveGame(gameId: string) {
    this.joinGameReq = null;
    this.socket.emit('LeaveGame', { gameId });
    return merge(this.onLeaveSuccess(), this.onLeaveError())
    .pipe(first(), map((data) => {
      if (isString(data)) { throw new Error(data as string); }
      return data as boolean;
    }));
  }
  private onLeaveSuccess() {
    return this.socket.fromEvent<boolean>('LeaveSuccess');
  }
  private onLeaveError() {
    return this.socket.fromEvent<string>('LeaveError');
  }
  onGamerLeaved() {
    return this.socket.fromEvent<any>('GamerLeaved');
  }
  //#endregion LeaveGame

}
