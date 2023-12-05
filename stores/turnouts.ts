import {
    type Destination,
    type Turnout,
    type TurnoutLink,
    TurnoutState,
    type MapPoint,
} from '@trainlink-org/trainlink-types';
import { defineStore, acceptHMRUpdate } from 'pinia';

interface Transaction {
    id: number;
    newObjects: {
        turnouts: Map<number, Turnout>;
        destinations: Map<number, Destination>;
    };
    deletedObjects: {
        turnouts: number[];
        destinations: number[];
    };
}

export const useTurnoutStore = defineStore('turnouts', () => {
    const turnouts = ref(new Map<number, Turnout>());
    const destinations = ref(new Map<number, Destination>());
    const connections = ref(new Map<number, TurnoutLink>());
    const transactions = ref(new Map<number, Transaction>());
    const nextTransaction = ref(0);

    const allTurnouts = computed(() => {
        return Array.from(reactive(turnouts.value.values()));
    });
    const allDestinations = computed(() => {
        return Array.from(destinations.value.values());
    });
    const allTurnoutLinks = computed(() => {
        return Array.from(connections.value.values());
    });

    function getTurnout(id: number, inclTransactions: boolean = false) {
        if (inclTransactions) {
            return allTurnouts.value
                .filter(
                    (turnout) =>
                        !Array.from(transactions.value.values())
                            .map(
                                (transaction) =>
                                    transaction.deletedObjects.turnouts,
                            )
                            .flat()
                            .includes(turnout.id),
                )
                .concat(
                    Array.from(transactions.value.values())
                        .map((transaction) =>
                            Array.from(
                                transaction.newObjects.turnouts.values(),
                            ),
                        )
                        .flat(),
                )
                .filter((turnout) => turnout.id === id)[0];
        }
        return turnouts.value.get(id);
    }

    function getDestination(id: number, inclTransactions = false) {
        if (inclTransactions) {
            return allDestinations.value
                .concat(
                    Array.from(transactions.value.values())
                        .map((transaction) =>
                            Array.from(
                                transaction.newObjects.destinations.values(),
                            ),
                        )
                        .flat(),
                )
                .filter(
                    (destination) =>
                        !Array.from(transactions.value.values())
                            .map(
                                (transaction) =>
                                    transaction.deletedObjects.destinations,
                            )
                            .flat()
                            .includes(destination.id),
                )
                .filter((destination) => destination.id === id)[0];
        }
        return destinations.value.get(id);
    }

    function getMapPoint(
        id: number,
        inclTransactions = false,
    ): MapPoint | undefined {
        // return turnouts.value.get(id) || destinations.value.get(id);
        return (
            getDestination(id, inclTransactions) ||
            getTurnout(id, inclTransactions)
        );
    }

    function getTurnoutLink(id: number) {
        return connections.value.get(id);
    }

    function addTurnout(transactionID: number, turnout: Turnout) {
        // turnouts.value.set(turnout.id, turnout);
        transactions.value
            .get(transactionID)
            ?.newObjects.turnouts.set(turnout.id, turnout);
    }

    function addDestination(transactionID: number, destination: Destination) {
        // destinations.value.set(destination.id, destination);
        transactions.value
            .get(transactionID)
            ?.newObjects.destinations.set(destination.id, destination);
    }

    function addTurnoutLink(turnoutLink: TurnoutLink) {
        connections.value.set(turnoutLink.id, turnoutLink);
    }

    function deleteMapPoint(transactionID: number, mapPointID: number) {
        deleteDestination(transactionID, mapPointID);
        deleteTurnout(transactionID, mapPointID);
    }

    function deleteDestination(transactionID: number, destinationID: number) {
        transactions.value
            .get(transactionID)
            ?.deletedObjects.destinations.push(destinationID);
        transactions.value
            .get(transactionID)
            ?.newObjects.destinations.delete(destinationID);
    }

    function deleteTurnout(transactionID: number, turnoutID: number) {
        transactions.value
            .get(transactionID)
            ?.deletedObjects.turnouts.push(turnoutID);
        transactions.value
            .get(transactionID)
            ?.newObjects.turnouts.delete(turnoutID);
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

    function startTransaction() {
        transactions.value.set(nextTransaction.value, {
            id: nextTransaction.value,
            deletedObjects: {
                turnouts: [],
                destinations: [],
            },
            newObjects: {
                turnouts: new Map(),
                destinations: new Map(),
            },
        });
        nextTransaction.value++;
        return nextTransaction.value - 1;
    }

    function revertTransaction(transactionID: number) {
        transactions.value.delete(transactionID);
    }

    function applyTransaction(transactionID: number) {
        const transaction = transactions.value.get(transactionID);
        if (!transaction) return false;
        transaction.deletedObjects.turnouts.forEach((turnoutID) => {
            turnouts.value.delete(turnoutID);
        });
        transaction.deletedObjects.destinations.forEach((destinationID) => {
            destinations.value.delete(destinationID);
        });
        transaction.newObjects.turnouts.forEach((turnout) => {
            turnouts.value.set(turnout.id, turnout);
        });
        transaction.newObjects.destinations.forEach((destination) => {
            destinations.value.set(destination.id, destination);
        });
        return transactions.value.delete(transactionID);
    }

    const allTurnoutsInclTransactions = computed(() => {
        let storedTurnouts = Array.from(turnouts.value.values());
        const deletedTurnouts = Array.from(transactions.value.values())
            .map((transaction) => transaction.deletedObjects.turnouts)
            .flat();
        const addedTurnouts = Array.from(transactions.value.values())
            .map((transaction) =>
                Array.from(transaction.newObjects.turnouts.values()),
            )
            .flat();
        console.log(addedTurnouts);
        storedTurnouts = storedTurnouts.filter(
            (turnout) => !deletedTurnouts.includes(turnout.id),
        );
        return storedTurnouts.concat(addedTurnouts);
    });

    const allDestinationsInclTransactions = computed(() => {
        let storedDestinations = Array.from(destinations.value.values());
        const deletedDestinations = Array.from(transactions.value.values())
            .map((transaction) => transaction.deletedObjects.destinations)
            .flat();
        const addedDestinations = Array.from(transactions.value.values())
            .map((transaction) =>
                Array.from(transaction.newObjects.destinations.values()),
            )
            .flat();
        storedDestinations = storedDestinations.filter(
            (destination) => !deletedDestinations.includes(destination.id),
        );
        return storedDestinations.concat(addedDestinations);
    });

    return {
        transactions,
        allTurnouts,
        allDestinations,
        allTurnoutLinks,
        getTurnout,
        getDestination,
        getTurnoutLink,
        getMapPoint,
        addTurnout,
        addDestination,
        addTurnoutLink,
        deleteTurnout,
        deleteDestination,
        deleteMapPoint,
        updateTurnout,
        updateDestination,
        setLinkStates,
        allTurnoutsInclTransactions,
        allDestinationsInclTransactions,
        startTransaction,
        revertTransaction,
        applyTransaction,
    };
});
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTurnoutStore, import.meta.hot));
}
