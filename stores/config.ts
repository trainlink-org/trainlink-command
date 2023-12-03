import type { HardwareDevice } from '@trainlink-org/trainlink-types';
import { defineStore, acceptHMRUpdate } from 'pinia';

export const useConfigStore = defineStore('config', () => {
    const driverName = ref('');
    const driverMsg = ref('');
    const availableDrivers: Ref<string[]> = ref([]);
    const availableDevices: Ref<HardwareDevice[]> = ref([]);
    const device: Ref<HardwareDevice | undefined> = ref();
    const connected = ref(false);
    const serverVersion = ref('');
    const serverName = ref('');
    const serverProductName = ref('');
    const trackPower = ref(false);

    return {
        driverName,
        driverMsg,
        availableDrivers,
        availableDevices,
        device,
        connected,
        serverVersion,
        serverName,
        serverProductName,
        trackPower,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useConfigStore, import.meta.hot));
}
