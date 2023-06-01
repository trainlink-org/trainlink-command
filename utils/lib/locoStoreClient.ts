import type { Socket } from 'socket.io-client';
import { Direction } from '@trainlink-org/trainlink-types';

import type {
    ServerToClientEvents,
    ClientToServerEvents,
} from '@trainlink-org/trainlink-types';
import {
    Throttle,
    LocoStoreBase,
    LocoStoreClient,
} from '@trainlink-org/shared-lib';

import { watch } from 'vue';

export class LocoStoreSocket extends LocoStoreBase implements LocoStoreClient {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private onLoadedCallback: (() => void)[] = [];

    constructor(socket: Socket) {
        super();
        this.socket = socket;
        this.socket.on('throttle/speedUpdate', (identifier, speed) => {
            const loco = this.getLocoFromIdentifier(identifier);
            if (loco) {
                loco.speed = speed;
            }
        });
        this.socket.on('throttle/directionUpdate', (identifier, direction) => {
            const loco = this.getLocoFromIdentifier(identifier);
            if (loco) {
                loco.direction = direction;
            }
        });
    }

    onLoaded(callback: () => void) {
        this.onLoadedCallback.push(callback);
    }

    triggerLoaded() {
        this.onLoadedCallback.forEach((callback) => {
            callback();
        });
    }

    listener(throttle: Throttle, throttleID: number, callback: () => void) {
        const incoming = {
            speed: 0,
            direction: Direction.stopped,
        };
        watch(
            () => throttle.speed,
            (newSpeed) => {
                callback();
                if (incoming.speed !== newSpeed) {
                    // console.log('sending speed');
                    this.socket.emit(
                        'throttle/setSpeed',
                        throttle.name,
                        newSpeed,
                        throttleID
                    );
                }
            }
        );
        watch(
            () => throttle.direction,
            (newDirection) => {
                callback();
                if (incoming.direction !== newDirection) {
                    this.socket.emit(
                        'throttle/setDirection',
                        throttle.name,
                        newDirection
                    );
                }
            }
        );

        this.socket.on(
            'throttle/speedUpdate',
            (identifier, speed, socketId, incomingThrottleID) => {
                // console.log(`Speed update (listener): ${socketId} - ${speed}`);
                incoming.speed = speed;
                if (
                    (throttle.name === identifier ||
                        throttle.locoAddress === identifier) &&
                    (socketId !== this.socket.id ||
                        (socketId === this.socket.id &&
                            throttleID !== incomingThrottleID))
                ) {
                    throttle.speed = speed;
                }
            }
        );
        this.socket.on('throttle/directionUpdate', (identifier, direction) => {
            incoming.direction = direction;
            if (
                throttle.name === identifier ||
                throttle.locoAddress === identifier
            ) {
                throttle.direction = direction;
            }
        });
    }
}
