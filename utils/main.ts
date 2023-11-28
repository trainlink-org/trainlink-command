// import { createApp, type Ref, reactive, ref } from 'vue';
// import App from './App.vue';
// import router from './router';

// import { socket } from './socketHelper';
// import type { AutomationScriptClient, Destination, PID, RunningAutomationClient, Turnout, TurnoutLink, RouteObject } from './shared';
import type {
    AutomationScriptClient,
    Destination,
    PID,
    RunningAutomationClient,
    Turnout,
    TurnoutLink,
    RouteObject,
} from '@trainlink-org/trainlink-types';
import type { DestinationState } from '../components/mapComponents/shared';

export const trackPower = ref(false);
// export const store = reactive(new LocoStoreSocket(socket));
export const automationList: Map<number, AutomationScriptClient> = reactive(
    new Map(),
);
export const runningAutomations: Ref<Map<PID, RunningAutomationClient>> = ref(
    new Map(),
);
export const allocatedLocos: Ref<Map<number, PID>> = ref(new Map());
// export const turnouts: Map<number, Turnout> = reactive(new Map());
// export const destinations: Map<number, Destination> = reactive(new Map());
// export const turnoutLinks: Map<number, TurnoutLink> = reactive(new Map());
// export const targetNameCache: string[] = [];
// export const cached: boolean[] = [];
export const usedLinks: Map<number, number> = reactive(new Map());
export const usedDestinations: Map<number, number> = reactive(new Map());
export const usedTurnouts: Map<number, number> = reactive(new Map());
export const activeRoutes: RouteObject[] = [];
export const destinationStates: Map<number, DestinationState> = reactive(
    new Map(),
);

// export const version = reactive({
//     clientVersion: '0.0.0',
//     clientName: 'TrainLink Command',
//     serverVersion: '0.0.0',
//     serverName: 'Default server',
// });

// export const connected = ref(false);

// const app = createApp(App);

// app.use(router);

// app.mount('#app');
