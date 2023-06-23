// import { Loco } from '@trainlink-org/trainlink-types';
import { Direction } from '@trainlink-org/trainlink-types';
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

    function updateLoco(oldAddress: number, name: string, newAddress: number) {
        const loco = definedLocos.value.get(oldAddress);
        if (loco) {
            removeLoco(oldAddress);
            addLoco({
                name: name,
                address: newAddress,
                speed: loco.speed,
                direction: loco.direction,
                locked: loco.locked,
                automationPID: loco.automationPID,
            });
        }
    }

    function getLoco(locoId: string | number) {
        let address: number | undefined;
        if (typeof locoId === 'string') {
            address = nameLookup.value.get(locoId);
        } else {
            address = locoId;
        }
        if (address) {
            return definedLocos.value.get(address);
        } else return undefined;
    }

    function switchActiveThrottle(throttleId: number, locoId: number) {
        activeThrottles.value.forEach((value) => {
            definedLocos.value.set(value.address, value);
        });
        const loco = definedLocos.value.get(locoId);
        if (loco) {
            activeThrottles.value[throttleId] = loco;
        }
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
        addressFromName,
        activeThrottles,
        allLocos,
        locoNames,
        addLoco,
        removeLoco,
        switchActiveThrottle,
        lock,
        unlock,
        getLoco,
        updateLoco,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useLocoStore, import.meta.hot));
}
