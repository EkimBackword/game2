import {
    WebSocketGateway,
    SubscribeMessage,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsMyGuard } from './ws-my.guard';

import { GameService } from './game.service';
import { GameInfo, IUser, GameState } from './models/game-info.dto';
import { IAuthRequest, ICreateGameRequest, IGameRequest, IGameEventRequest } from './models/gateway.model';

@WebSocketGateway(1082, { namespace: 'games' })
export class GameGateway implements OnGatewayDisconnect {

    constructor(
        private readonly gameService: GameService,
    ) { }

    handleDisconnect(socket: Socket) {
        for (const key in socket.rooms) {
            if (socket.rooms.hasOwnProperty(key)) {
                const gameId = socket.rooms[key];
                const user = this.checkUser(socket);
                this.onLeaveGame(socket, { gameId, user });
            }
        }
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
        const res = [];
        const games = this.gameService.findList();
        for (const game of games.values()) {
            if (game.state === GameState.WAITING) {
                res.push(game);
            } else if (game.getUser(req.user.id) !== null) {
                res.push(game);
            }
        }
        socket.emit('GetGamesSuccess', res);
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('CreateGame')
    async onCreateGame(socket: Socket, req: ICreateGameRequest) {
        try {
            const game = this.gameService.createGame(req.name, req.user.id, req.size, socket);
            game.joinUser(socket, req.user);
            socket.broadcast.emit('NewGameAdded', game.response);
            socket.emit('CreateGameSuccess', game.response);
        } catch (err) {
            socket.emit('CreateGameError', `Необработанная ошибка`);
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('JoinGame')
    async onJoinGame(socket: Socket, req: IGameRequest) {
        try {
            const game = this.gameService.findByID(req.gameId);
            if (game && req.user) {
                const flag = game.joinUser(socket, req.user);
                if (!flag) {
                    socket.emit('JoinGameError', 'Игра уже началась');
                    return;
                }
                game.toUsers(socket).emit('GamerJoined', req.user.id);
                socket.emit('JoinGameSuccess', game.response);
                return;
            }
            socket.emit('JoinGameError', `Игра не найдена - GameId: ${req.gameId}; User: ${req.user};`);
        } catch (err) {
            socket.emit('JoinGameError', 'Необработанная ошибка');
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('LeaveGame')
    onLeaveGame(socket: Socket, req: IGameRequest) {
        try {
            const game = this.gameService.findByID(req.gameId);
            if (game && req.user) {
                const flag = game.leaveUser(socket, req.user);
                if (!flag) {
                    socket.emit('LeaveGameError', 'Такого игрока небыло в игре');
                    return;
                }
                game.toUsers(socket).emit('GamerLeaved', game.gamers);
                socket.emit('LeaveGameSuccess', true);
                return;
            }
            socket.emit('LeaveGameError', `Игра не найдена - GameId: ${req.gameId}; User: ${req.user};`);
        } catch (err) {
            socket.emit('LeaveGameError', 'Необработанная ошибка');
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('StartGame')
    async onStartGame(socket: Socket, req: IGameRequest) {
        try {
            let game = this.gameService.findByID(req.gameId);
            if (game && game.hostId === req.user.id) {
                if (game.state !== GameState.WAITING) {
                    socket.emit('StartGameError', 'Игра уже началась');
                    return;
                }
                game = this.gameService.startGame(req.gameId, socket);
                socket.broadcast.emit('GameStarted', game.response);
                socket.emit('StartGameSuccess', game.response);
                return;
            }
            socket.emit('StartGameError', `Игра не найдена - GameId: ${req.gameId}; User: ${req.user};`);
        } catch (err) {
            socket.emit('StartGameError', 'Игра не найдена');
        }
    }

    @UseGuards(WsMyGuard)
    @SubscribeMessage('GameEvent')
    async onGameEvent(socket: Socket, req: IGameEventRequest) {
        try {
            const game = this.gameService.findByID(req.gameId);
            if (game) {
                // TODO: Применить событие
            }
            socket.emit('GameEventError', `Игра не найдена - GameId: ${req.gameId}; User: ${req.user};`);
        } catch (err) {
            socket.emit('GameEventError', 'Игра не найдена');
        }
    }
}
