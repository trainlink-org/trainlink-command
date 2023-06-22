// import { Loco } from '@trainlink-org/shared-lib';
import { Direction } from '@trainlink-org/shared-lib';
import { RefSymbol } from '@vue/reactivity';
import { defineStore, acceptHMRUpdate } from 'pinia';

export interface LocoClient {
    readonly name: string;
    readonly address: number;
    speed: number;
    direction: Direction;
    locked: boolean;
    automationPID: string;
}

export const useLocoStore = defineStore('locos', () => {
    const definedLocos = ref(new Map<number, LocoClient>());
    const nameLookup = ref(new Map<string, number>());
    const activeThrottles: Ref<LocoClient[]> = ref([]);
    // const activeThrottles: Ref<ActiveThrottle> = ref({});
    console.log('Inside Store');

    const allLocos = computed(() => {
        return Array.from(definedLocos.value.values());
    });

    const locoNames = computed(() => {
        return Array.from(definedLocos.value.values()).map((value) => {
            return value.name;
        });
    });

    function addLoco(loco: LocoClient) {
        definedLocos.value.set(loco.address, loco);
        nameLookup.value.set(loco.name, loco.address);
    }

    function removeLoco(locoId: string | number): void {
        let address: number | undefined;
        if (typeof locoId === 'string') {
            address = nameLookup.value.get(locoId);
        } else {
            address = locoId;
        }
        if (address) {
            const loco = definedLocos.value.get(address);
            if (loco) {
                definedLocos.value.delete(loco.address);
                nameLookup.value.delete(loco.name);
            }
        }
    }

    function switchActiveThrottle(throttleId: number, locoId: number) {
        activeThrottles.value.forEach((value) => {
            definedLocos.value.set(value.address, value);
        });
        const loco = definedLocos.value.get(locoId);
        if (loco) {
            // activeThrottles.value[throttleId] = new Proxy(loco, handler);
            activeThrottles.value[throttleId] = loco;
        }
    }
    function setSpeed(throttleId: number, speed: number) {
        activeThrottles.value[throttleId].speed = speed;
        console.log(activeThrottles.value[throttleId]);
        const loco = activeThrottles.value[throttleId];
        // socket.emit(
        //     'throttle/setSpeed',
        //     loco.address.value,
        //     loco.speed.value,
        //     throttleId
        // );
    }
    function addressFromName(name: string) {
        return nameLookup.value.get(name);
    }
    function lock(address: number, pid: string) {
        const loco = definedLocos.value.get(address);
        if (loco) {
            loco.locked = true;
            loco.automationPID = pid;
        }
    }
    function unlock(address: number) {
        const loco = definedLocos.value.get(address);
        if (loco) {
            loco.locked = false;
            loco.automationPID = '';
        }
    }

    return {
        nameLookup,
        addressFromName,
        definedLocos,
        activeThrottles,
        allLocos,
        locoNames,
        addLoco,
        removeLoco,
        setSpeed,
        switchActiveThrottle,
        lock,
        unlock,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useLocoStore, import.meta.hot));
}
// const store = useLocoStore();

// store.definedLocos.set(0, {
//     name: 'Test',
//     address: 0,
//     speed: 0,
//     direction: Direction.stopped,
// });

// store.activeThrottles[0] = store.definedLocos.get(0) || {
//     name: 'Test',
//     address: 0,
//     speed: 0,
//     direction: Direction.stopped,
// };

// store.activeThrottles[0].speed = 2;
