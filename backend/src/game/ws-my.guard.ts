import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsMyGuard implements CanActivate {

    async canActivate(context: ExecutionContext) {
        const client: Socket = context.switchToWs().getClient();
        const user = client.handshake.query;
        if (user instanceof Object) {
            context.switchToWs().getData().user = user;
            return user ? true : false;
        } else {
            return false;
        }
    }

}
