import { defineStore, acceptHMRUpdate } from 'pinia';

export const useConfigStore = defineStore('config', () => {
    const driverName = ref('');
    const driverMsg = ref('');
    const connected = ref(false);
    const serverVersion = ref('');
    const serverName = ref('');
    const serverProductName = ref('');

    return {
        driverName,
        driverMsg,
        connected,
        serverVersion,
        serverName,
        serverProductName,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useConfigStore, import.meta.hot));
}
