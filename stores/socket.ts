import { defineStore, acceptHMRUpdate } from 'pinia';
import { Socket, io } from 'socket.io-client';
import type {
    ServerToClientEvents,
    ClientToServerEvents,
} from '@trainlink-org/trainlink-types';
import {
    automationList,
    runningAutomations,
    allocatedLocos,
} from '@/utils/main';
import type {
    PID,
    RunningAutomationClient,
} from '@trainlink-org/trainlink-types';
// import { setLinkStates } from '@/components/mapComponents/shared';
import {
    usedDestinations,
    destinationStates,
    usedLinks,
    usedTurnouts,
} from '@/utils/main';
import { DestinationState } from '@/components/mapComponents/shared';

export const useSocketStore = defineStore('socket', () => {
    console.log('Socket store');
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
        'http://' +
            (window !== undefined ? window.location.hostname : 'localhost') +
            ':6868',
        // 'http://localhost:6868',
    );
    socket.on('connect', () => {
        console.log('Socket store connected');
    });
    const socketRef = ref(socket);

    socket.on('automation/fetchAllResponse', (automations) => {
        automationList.clear();
        automations.forEach((value) => {
            automationList.set(value.id, value);
        });
    });

    socket.on('automation/fetchRunningResponse', (automations) => {
        console.log('Running automations');
        const newRunningMap: Map<PID, RunningAutomationClient> = new Map();
        automations.forEach((value) => {
            newRunningMap.set(value.pid, value);
        });
        runningAutomations.value = newRunningMap;
        const newLocoMap: Map<number, PID> = new Map();
        automations.forEach((value) => {
            if (value.locoAddress) newLocoMap.set(value.locoAddress, value.pid);
        });
        allocatedLocos.value = newLocoMap;
        console.log(newLocoMap);
    });

    socket.on('routes/setRouteComponents', (destinations, turnouts, links) => {
        console.log('setRouteComponents');
        destinations.forEach((destination) => {
            usedDestinations.set(destination, 0);
            destinationStates.set(destination, DestinationState.active);
        });
        turnouts.forEach((turnout) => {
            usedTurnouts.set(turnout, 0);
        });
        links.forEach((link) => {
            usedLinks.set(link, 0);
        });
    });
    socket.on(
        'routes/unsetRouteComponents',
        (destinations, turnouts, links) => {
            destinations.forEach((destination) => {
                usedDestinations.delete(destination);
                destinationStates.set(destination, DestinationState.inactive);
            });
            turnouts.forEach((turnout) => {
                usedTurnouts.delete(turnout);
            });
            links.forEach((link) => {
                usedLinks.delete(link);
            });
        },
    );

    return {
        socketRef,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSocketStore, import.meta.hot));
}
