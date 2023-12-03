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

export function calculateMidPoints(
    startPoint: Coordinate,
    points: Coordinate[],
    endPoint: Coordinate,
) {
    const distanceFactor = 5;
    if (
        Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y) <
        distanceFactor
    ) {
        const midPoint = {
            x:
                Math.abs(endPoint.x - startPoint.x) +
                (startPoint.x < endPoint.x ? startPoint.x : endPoint.x),
            y:
                Math.abs(endPoint.y - startPoint.y) +
                (startPoint.y < endPoint.x ? startPoint.x : endPoint.x),
        };
        return {
            startMid: midPoint,
            endMid: midPoint,
        };
    }
    let afterStart = endPoint;
    let beforeEnd = startPoint;
    if (points.length === 1) {
        afterStart = points[0];
        beforeEnd = points[0];
    } else if (points.length > 1) {
        afterStart = points[0];
        beforeEnd = points[points.length - 1];
    }

    let startDistance = Math.hypot(
        afterStart.x - startPoint.x,
        afterStart.y - startPoint.y,
    );
    let endDistance = Math.hypot(
        beforeEnd.x - endPoint.x,
        beforeEnd.y - endPoint.y,
    );

    let startMidPoint = {
        x:
            startPoint.x +
            (distanceFactor / startDistance) * (afterStart.x - startPoint.x),
        y:
            startPoint.y +
            (distanceFactor / startDistance) * (afterStart.y - startPoint.y),
    };
    let endMidPoint = {
        x:
            endPoint.x +
            (distanceFactor / endDistance) * (beforeEnd.x - endPoint.x),
        y:
            endPoint.y +
            (distanceFactor / endDistance) * (beforeEnd.y - endPoint.y),
    };
    if (startDistance < distanceFactor) startMidPoint = afterStart;
    if (endDistance < distanceFactor) endMidPoint = beforeEnd;
    return {
        startMid: startMidPoint,
        endMid: endMidPoint,
    };
}
