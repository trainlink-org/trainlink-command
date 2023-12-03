<script setup lang="ts">
const props = defineProps<{
    options: Array<string>;
    selected: string;
    tabindex?: number;
}>();

const emit = defineEmits<{
    (e: 'update:selected', value: string): void;
    (e: 'opened'): void;
}>();

/** Stores whether the dropdown is open or not */
const open = ref(false);

/** Allows the template to access the selected prop */
const selectedComputed = computed({
    get() {
        return props.selected;
    },
    set(value) {
        emit('update:selected', value);
    },
});

watch(open, (open) => {
    if (open) {
        emit('opened');
    }
});
</script>

<template>
    <div
        class="relative h-6 w-max text-left outline-none"
        :tabindex="tabindex"
        @blur="open = false"
    >
        <!-- Always visible heading -->
        <div
            class="z-20 h-6 w-32 cursor-pointer select-none rounded-t rounded-b-none border border-solid border-slate-800"
            :class="
                open
                    ? 'border-t-slate-800 border-x-slate-800 bg-slate-500 text-white'
                    : 'bg-inherit text-black border-none'
            "
            @click="open = !open"
        >
            <div
                class="mx-auto w-fit border border-transparent border-b-black px-1 text-center"
            >
                {{ selectedComputed }}
                <span
                    class="absolute top-2.5 ml-2 h-0 w-0 border-4 border-solid border-transparent border-x-transparent border-t-black border-b-transparent"
                />
            </div>
        </div>
        <div
            v-show="open"
            class="absolute inset-x-0 z-20 w-32 overflow-hidden rounded-b border border-slate-800 border-t-slate-500 bg-slate-500"
        >
            <!-- Each item in the list -->
            <div
                v-for="(option, i) of props.options"
                :key="i"
                class="w-32 cursor-pointer select-none text-center text-white hover:bg-slate-200"
                @click="
                    selectedComputed = option;
                    open = false;
                "
            >
                {{ option }}
            </div>
        </div>
    </div>
</template>
