import type {
    AutomationScriptClient,
    PID,
    RunningAutomationClient,
    RouteObject,
} from '@trainlink-org/trainlink-types';
import type { DestinationState } from '../components/mapComponents/shared';

export const automationList: Map<number, AutomationScriptClient> = reactive(
    new Map(),
);
export const runningAutomations: Ref<Map<PID, RunningAutomationClient>> = ref(
    new Map(),
);
export const allocatedLocos: Ref<Map<number, PID>> = ref(new Map());
export const usedLinks: Map<number, number> = reactive(new Map());
export const usedDestinations: Map<number, number> = reactive(new Map());
export const usedTurnouts: Map<number, number> = reactive(new Map());
export const activeRoutes: RouteObject[] = [];
export const destinationStates: Map<number, DestinationState> = reactive(
    new Map(),
);
