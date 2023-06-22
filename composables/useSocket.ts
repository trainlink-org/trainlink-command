import { useLocoStore } from '~/stores/locos';
import { Loco } from '@trainlink-org/shared-lib';
export default function () {
    const context = useNuxtApp();
    const locoStore = useLocoStore(context.$pinia);
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
    socket.on('automation/fetchRunningResponse', (automations) => {
        console.log('Updating locked');
        const usedLocos = automations.map(
            (automation) => automation.locoAddress
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
            const loco = locoStore.definedLocos.get(identifier);
            if (loco) loco.speed = speed;
        }
    });
    socket.on('throttle/directionUpdate', (identifier, direction) => {
        if (typeof identifier === 'number') {
            const loco = locoStore.definedLocos.get(identifier);
            if (loco) loco.direction = direction;
        }
    });
}
