<script setup lang="ts">
// import ButtonComponent from './ButtonComponent.vue';

const props = defineProps({
    title: {type: String, required: true},
    submitText: {type: String, required: false, default: 'Submit'},
    cancelText: {type: String, required: false, default: 'Cancel'},
});

const emit = defineEmits<{
    (e: 'submit'): void;
    (e: 'cancel'): void;
}>();

</script>

<template>
    <div
        class="absolute top-0 left-0 z-20 h-screen w-screen bg-black opacity-25"
        @click="emit('cancel')"
    />
    <div
        class="absolute top-0 left-0 z-30 flex h-screen w-screen items-center justify-center bg-transparent"
        @click="emit('cancel')"
    >
        <div
            class="flex h-1/3 w-2/3 flex-col justify-between rounded-lg border-4 border-borderColor-300 bg-white text-center md:w-1/3"
            @click="(event) => event.stopPropagation()"
        >
            <div>
                <h1
                    class="w-full border-b-2 border-borderColor-300 bg-transparent text-lg"
                >
                    {{ props.title }}
                </h1>
                <!-- <span
                    class="border-b-2 border-borderColor-300 w-full"
                /> -->
                <div class="p-1">
                    <slot/>
                </div>
            </div>
            <div
                class="flex justify-end space-x-1 p-1"
            >
                <ButtonComponent
                    v-if="props.cancelText !== '_hidden_'"
                    class="border-2 border-primary-400 hover:bg-accent-100"
                    @click="emit('cancel')"
                >
                    {{ props.cancelText }}
                </ButtonComponent>
                <ButtonComponent
                    class="border-2 border-accent-400 bg-accent-400  hover:bg-accent-300"
                    @click="emit('submit')"
                >
                    {{ props.submitText }}
                </ButtonComponent>
            </div>
        </div>
    </div>
</template>