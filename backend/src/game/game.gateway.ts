import {
    WebSocketGateway,
    SubscribeMessage,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsMyGuard } from './ws-my.guard';

import { GameService } from './game.service';
import {
    IUser,
    GameState,
    IGameInfoResponse,
    IAuthRequest,
    ICreateGameRequest,
    IGameRequest,
    IGameEventRequest,
    IAddPushSubscriberRequest,
} from './models';
import { PushService } from './push.service';

export interface IUserToGame {
    gameId: string;
    sockets: string[];
}

@WebSocketGateway(1082, { namespace: 'games' })
export class GameGateway implements OnGatewayDisconnect {

    userToGame = new Map<string, IUserToGame>();
    join(socket: Socket, user: IUser, gameId: string) {
        const data: IUserToGame = {
            gameId,
            sockets: [socket.id],
        };
        if (this.userToGame.has(user.id)) {
            data.sockets = data.sockets.concat(this.userToGame.get(user.id).sockets);
        }
        this.userToGame.set(user.id, data);
    }
    leave(socket: Socket, user: IUser) {
        if (this.userToGame.has(user.id)) {
            const data = this.userToGame.get(user.id);
            const index = data.sockets.indexOf(socket.id);
            data.sockets.splice(index, 1);
            if (data.sockets.length === 0) {
                this.onLeaveGame(socket, { gameId: data.gameId, user });
            }
        }
    }

    constructor(
        private readonly gameService: GameService,
        private readonly pushService: PushService,
    ) { }

    handleDisconnect(socket: Socket) {
        const user = this.checkUser(socket);
        this.leave(socket, user);
    }

    private checkUser(socket: Socket) {
        const user = socket.handshake.query as IUser;
        if (user instanceof Object) {
            return user;
        } else {
            return null;
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('GetGames')
    async onGetGames(socket: Socket, req: IAuthRequest) {
        const res: IGameInfoResponse[] = [];
        const games = this.gameService.findList();
        for (const game of games.values()) {
            const diff = Number(new Date()) - Number(game.lastUpdate);
            if ( (diff) / (1000 * 60 * 60 * 24) > 2) {
                games.delete(game.GameId);
            } else if (game.state === GameState.WAITING) {
                res.push(game.response);
            } else if (game.getUser(req.user.id) !== null) {
                res.push(game.response);
            }
        }
        socket.emit('GetGamesSuccess', res);
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('CreateGame')
    async onCreateGame(socket: Socket, req: ICreateGameRequest) {
        try {
            const game = await this.gameService.createGame(req.name, req.user.id, req.size, socket);
            game.joinUser(req.user, socket);
            this.pushService.pushAll({
                title: `Новая игра "${req.name}" создана`,
                body: `Создатель игры: ${req.user.name}`,
                gameId: game.id,
            }, req.user);
            socket.broadcast.emit('NewGameAdded', game.response);
            socket.emit('CreateGameSuccess', game.response);
        } catch (err) {
            socket.emit('CreateGameError', err.message);
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('JoinGame')
    async onJoinGame(socket: Socket, req: IGameRequest) {
        try {
            const game = this.gameService.findByID(req.gameId);
            if (game && req.user) {
                const flag = game.joinUser(req.user, socket);
                if (!flag) {
                    socket.emit('JoinGameError', 'Игра уже началась');
                    return;
                }
                this.join(socket, req.user, game.GameId);
                game.toUsers(socket).emit('GamerJoined', req.user);
                socket.emit('JoinGameSuccess', game.response);
                return;
            }
            socket.emit('JoinGameError', `Игра не найдена`);
        } catch (err) {
            socket.emit('JoinGameError', err.message);
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('LeaveGame')
    onLeaveGame(socket: Socket, req: IGameRequest) {
        try {
            const game = this.gameService.findByID(req.gameId);
            if (game && req.user) {
                const flag = game.leaveUser(req.user, socket);
                if (!flag) {
                    socket.emit('LeaveGameError', 'Такого игрока небыло в игре');
                    return;
                }
                this.userToGame.delete(req.user.id);
                game.toUsers(socket).emit('GamerLeaved', req.user);
                socket.emit('LeaveGameSuccess', true);
                return;
            }
            socket.emit('LeaveGameError', `Игра не найдена`);
        } catch (err) {
            socket.emit('LeaveGameError', err.message);
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('StartGame')
    async onStartGame(socket: Socket, req: IGameRequest) {
        try {
            const game = this.gameService.findByID(req.gameId);
            if (game && game.hostId === req.user.id) {
                if (game.state !== GameState.WAITING) {
                    socket.emit('StartGameError', 'Игра уже началась');
                    return;
                }
                game.startBackend();
                socket.broadcast.emit('GameStarted', game.response);
                socket.emit('StartGameSuccess', game.response);
                return;
            }
            socket.emit('StartGameError', `Игра не найдена`);
        } catch (err) {
            socket.emit('StartGameError', err.message);
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('GameEvent')
    async onGameEvent(socket: Socket, req: IGameEventRequest) {
        try {
            const game = this.gameService.findByID(req.gameId);
            if (game) {
                game.event(req.event);
                await this.gameService.save(game.response);
                socket.broadcast.emit('GameEvent', req);
                socket.emit('GameEvent', req);
                socket.emit('GameEventSuccess', true);
            }
            socket.emit('GameEventError', `Игра не найдена`);
        } catch (err) {
            socket.emit('GameEventError', err.message);
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('AddPushSubscriber')
    async onAddPushSubscriber(socket: Socket, req: IAddPushSubscriberRequest) {
        try {
            this.pushService.sub(req);
            socket.emit('AddPushSubscriberSuccess', true);
        } catch (err) {
            socket.emit('AddPushSubscriberError', err.message);
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('DeletePushSubscriber')
    async onDeletePushSubscriber(socket: Socket, req: IAuthRequest) {
        try {
            this.pushService.unsub(req);
            socket.emit('DeletePushSubscriberSuccess', true);
        } catch (err) {
            socket.emit('DeletePushSubscriberError', err.message);
        }
    }
}
