<script setup lang="ts">
const props = defineProps({
    title: { type: String, required: true },
    submitText: { type: String, required: false, default: 'Submit' },
    cancelText: { type: String, required: false, default: 'Cancel' },
});

const emit = defineEmits<{
    (e: 'submit'): void;
    (e: 'cancel'): void;
}>();
</script>

<template>
    <div
        class="fixed top-0 left-0 z-20 h-screen w-screen bg-black opacity-25"
        @click="emit('cancel')"
    />
    <div
        class="fixed top-0 left-0 z-30 flex h-screen w-screen items-center justify-center bg-transparent"
        @click="emit('cancel')"
    >
        <div
            class="flex h-2/5 w-2/3 flex-col justify-between rounded-lg border-4 border-borderColor-300 bg-white text-center md:w-3/5 lg:w-2/5 relative"
            @click="(event) => event.stopPropagation()"
        >
            <h1
                class="w-full border-b-2 border-borderColor-300 bg-transparent text-lg"
            >
                {{ props.title }}
            </h1>
            <div class="static h-full overflow-scroll">
                <!-- <span
                    class="border-b-2 border-borderColor-300 w-full"
                /> -->
                <div class="p-1 static overflow-y-scroll">
                    <slot />
                </div>
            </div>
            <div class="flex justify-end space-x-1 p-1 border-t-2 w-full">
                <ButtonComponent
                    v-if="props.cancelText !== '_hidden_'"
                    class="border-2 border-primary-400 hover:bg-accent-100"
                    @click="emit('cancel')"
                >
                    {{ props.cancelText }}
                </ButtonComponent>
                <ButtonComponent
                    class="border-2 border-accent-400 bg-accent-400 hover:bg-accent-300"
                    @click="emit('submit')"
                >
                    {{ props.submitText }}
                </ButtonComponent>
            </div>
        </div>
    </div>
</template>
