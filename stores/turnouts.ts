import {
    type Destination,
    type Turnout,
    type TurnoutLink,
    TurnoutState,
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

    function updateTurnout(turnout: Turnout) {
        turnouts.value.set(turnout.id, turnout);
    }

    function updateDestination(destination: Destination) {
        destinations.value.set(destination.id, destination);
    }

    function setLinkStates(turnoutID: number, turnoutState: TurnoutState) {
        const turnout = turnouts.value.get(turnoutID);
        if (turnout) {
            const primaryLink = connections.value.get(turnout.primaryDirection);
            const secondaryLink = connections.value.get(
                turnout.secondaryDirection,
            );
            if (turnoutState === TurnoutState.closed) {
                if (primaryLink) {
                    if (primaryLink.start === turnoutID) {
                        primaryLink.startActive = true;
                    } else {
                        primaryLink.endActive = true;
                    }
                }
                if (secondaryLink) {
                    if (secondaryLink.start === turnoutID) {
                        secondaryLink.startActive = false;
                    } else {
                        secondaryLink.endActive = false;
                    }
                }
            } else {
                if (primaryLink) {
                    if (primaryLink.start === turnoutID) {
                        primaryLink.startActive = false;
                    } else {
                        primaryLink.endActive = false;
                    }
                }
                if (secondaryLink) {
                    if (secondaryLink.start === turnoutID) {
                        secondaryLink.startActive = true;
                    } else {
                        secondaryLink.endActive = true;
                    }
                }
            }
        }
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
        updateTurnout,
        updateDestination,
        setLinkStates,
    };
});
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTurnoutStore, import.meta.hot));
}
