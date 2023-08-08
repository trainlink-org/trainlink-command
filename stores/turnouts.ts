import {
    Destination,
    Turnout,
    TurnoutLink,
} from '@trainlink-org/trainlink-types';
import { defineStore, acceptHMRUpdate } from 'pinia';

export const useTurnoutStore = defineStore('turnouts', () => {
    const turnouts = ref(new Map<number, Turnout>());
    const destinations = ref(new Map<number, Destination>());
    const connections = ref(new Map<number, TurnoutLink>());

    const allTurnouts = computed(() => {
        return Array.from(turnouts.value.values());
    });
    const allDestinations = computed(() => {
        return Array.from(destinations.value.values());
    });
    const allTurnoutLinks = computed(() => {
        return Array.from(connections.value.values());
    });

    function getTurnout(id: number) {
        return turnouts.value.get(id);
    }

    function getDestination(id: number) {
        return destinations.value.get(id);
    }

    function getTurnoutLink(id: number) {
        return connections.value.get(id);
    }

    function addTurnout(turnout: Turnout) {
        turnouts.value.set(turnout.id, turnout);
    }

    function addDestination(destination: Destination) {
        destinations.value.set(destination.id, destination);
    }

    function addTurnoutLink(turnoutLink: TurnoutLink) {
        connections.value.set(turnoutLink.id, turnoutLink);
    }

    return {
        allTurnouts,
        allDestinations,
        allTurnoutLinks,
        getTurnout,
        getDestination,
        getTurnoutLink,
        addTurnout,
        addDestination,
        addTurnoutLink,
    };
});
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTurnoutStore, import.meta.hot));
}
