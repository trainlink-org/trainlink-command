<!-- Used to display a turnout on the Routes map -->
<script setup lang="ts">
import type { Coordinate, Turnout } from '@trainlink-org/trainlink-types';

const props = defineProps({
    turnout: { type: Object as () => Turnout, required: true },
    offset: { type: Object as () => Coordinate, default: { x: 0, y: 0 } },
});
</script>

<template>
    <circle
        class="hover:fill-primary-400 active:fill-red-600"
        :class="props.turnout.usedInRoute ? 'fill-blue-700' : ''"
        :cx="props.turnout.coordinate.x + props.offset.x"
        :cy="props.turnout.coordinate.y + props.offset.y"
        :r="1.25"
    />
</template>
