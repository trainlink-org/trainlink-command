<!-- Used to display a turnout on the Routes map -->
<script setup lang="ts">
import type { Coordinate, Turnout } from '@trainlink-org/trainlink-types';

const props = defineProps({
    turnout: { type: Object as () => Turnout, required: true },
    settings: { type: Boolean, default: false },
});
</script>

<template>
    <circle
        class="hover:fill-primary-400 active:fill-red-600"
        :class="props.turnout.usedInRoute && !settings ? 'fill-blue-700' : ''"
        :cx="props.turnout.coordinate.x"
        :cy="props.turnout.coordinate.y"
        :r="1.25"
    />
</template>
