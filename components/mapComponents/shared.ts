export const isTouchScreen = ref(false);
export const svgWidth = ref(100);
export const svgHeight = ref(100);

export function calculateSize(size: number) {
    if (isTouchScreen.value) {
        return (((size * 2) / 100) * (svgHeight.value + svgWidth.value)) / 3;
    } else {
        return ((size / 100) * (svgHeight.value + svgWidth.value)) / 3;
    }
}

// Converts a virtual coord to one that matches the size of the svg, but avoiding the very edges of the svg
export function calculateXCoord(coord: number): number {
    return (coord / 100) * (svgWidth.value - 6) + 3;
}

export function calculateYCoord(coord: number): number {
    return (coord / 100) * (svgHeight.value - 6) + 3;
}

export function calculateCoord(coord: Coordinate): Coordinate {
    return {
        x: calculateXCoord(coord.x),
        y: calculateYCoord(coord.y),
    };
}

export interface Coordinate {
    x: number;
    y: number;
}

export enum DestinationState {
    inactive = 'Inactive', //Normal
    selected = 'Selected', //Being selected for a new route
    active = 'Active', //Part of an active route
}
