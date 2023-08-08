import { io, Socket } from 'socket.io-client';
import { useLocoStore } from '~/stores/locos';
import { isDestination, isTurnout, Loco } from '@trainlink-org/trainlink-types';
import { useConfigStore } from '~/stores/config';
import type {
    ServerToClientEvents,
    ClientToServerEvents,
} from '@trainlink-org/trainlink-types';
import { useSocketStore } from '@/stores/socket';
import { useTurnoutStore } from '@/stores/turnouts';

export default function () {
    const context = useNuxtApp();
    const locoStore = useLocoStore(context.$pinia);
    const configStore = useConfigStore(context.$pinia);
    const turnoutStore = useTurnoutStore(context.$pinia);
    const runtimeConfig = useRuntimeConfig();
    const socket = useSocketStore().socketRef;

    // const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    //     typeof window !== 'undefined'
    //         ? io('http://' + window.location.hostname + ':6868')
    //         : io('http://localhost:6868');
    // console.log('Composable');
    socket.on('connect', () => {
        // connected.value = true;
        configStore.connected = true;
        console.log('Connected!\nId is ' + socket.id);
        socket.emit(
            'metadata/handshake',
            runtimeConfig.public.name,
            runtimeConfig.public.productName,
            runtimeConfig.public.version,
        );
    });

    socket.on('disconnect', () => {
        configStore.connected = false;
        console.log('Disconnected');
    });

    socket.on(
        'metadata/handshake',
        (serverName, serverProductName, serverVersion) => {
            configStore.serverName = serverName;
            configStore.serverProductName = serverProductName;
            configStore.serverVersion = serverVersion;
        },
    );

    socket.on('metadata/initialState/locos', async (locosState) => {
        console.log('New initial state');
        for (const locoString of locosState) {
            const loco = Loco.fromJson(JSON.parse(locoString));
            locoStore.addLoco({
                name: loco.name,
                address: loco.address,
                speed: loco.speed,
                direction: loco.direction,
                locked: false,
                automationPID: '',
            });
            console.log('Added to store');
        }
    });

    socket.on('metadata/initialState/turnouts', (packet) => {
        packet.turnouts.forEach((turnout) => {
            turnoutStore.addTurnout(turnout);
        });
        packet.destinations.forEach((destination) => {
            turnoutStore.addDestination(destination);
        });
        packet.links.forEach((turnoutLinks) => {
            turnoutStore.addTurnoutLink(turnoutLinks);
        });
    });

    socket.on('metadata/availableDrivers', (drivers) => {
        configStore.availableDrivers = drivers;
    });

    socket.on('automation/fetchRunningResponse', (automations) => {
        console.log('Updating locked');
        const usedLocos = automations.map(
            (automation) => automation.locoAddress,
        );
        console.log(usedLocos);
        locoStore.allLocos.forEach((loco) => {
            if (!usedLocos.includes(loco.address)) {
                locoStore.unlock(loco.address);
            }
        });
        automations.forEach((automation) => {
            if (automation.locoAddress) {
                locoStore.lock(automation.locoAddress, automation.pid);
            }
        });
    });

    socket.on('throttle/speedUpdate', (identifier, speed, socketId) => {
        if (typeof identifier === 'number' && socketId !== socket.id) {
            const loco = locoStore.getLoco(identifier);
            if (loco) loco.speed = speed;
        }
    });
    socket.on('throttle/directionUpdate', (identifier, direction) => {
        if (typeof identifier === 'number') {
            const loco = locoStore.getLoco(identifier);
            if (loco) loco.direction = direction;
        }
    });
    socket.on('config/newLocoAdded', (loco) => {
        const locoObject = Loco.fromJson(JSON.parse(loco));
        locoStore.addLoco({
            name: locoObject.name,
            address: locoObject.address,
            speed: locoObject.speed,
            direction: locoObject.direction,
            locked: false,
            automationPID: '',
        });
    });

    socket.on('config/locoEdited', (oldAddress, newAddress, name) => {
        locoStore.updateLoco(oldAddress, name, newAddress);
    });

    socket.on('config/locoDeleted', (address) => {
        locoStore.removeLoco(address);
    });

    socket.on('hardware/driverChanged', (driver, driverMsg) => {
        configStore.driverName = driver;
        configStore.driverMsg = driverMsg;
    });

    socket.on('hardware/availableDevices', (devices) => {
        console.log(devices);
        configStore.availableDevices = [];
        devices.forEach((device) => {
            configStore.availableDevices.push(device);
        });
        console.log(configStore.availableDevices);
    });

    socket.on('hardware/newActiveDevice', (device) => {
        configStore.device = device;
    });

    socket.on('routes/mapPointUpdate', (object) => {
        if (isTurnout(object)) turnoutStore.updateTurnout(object);
        else if (isDestination(object)) turnoutStore.updateDestination(object);
    });

    return { socket };
}
