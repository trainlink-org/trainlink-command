<!-- Displays a non-running script on the Automations page -->
<script setup lang="ts">
import { automationList, allocatedLocos } from '@/utils/main';
// import { ref, watch, computed } from 'vue';
// import { useRoute, useRouter } from 'vue-router';
import { socket } from '@/utils/socketHelper';
import { AutomationType } from '@trainlink-org/trainlink-types';
import { useLocoStore } from '~/stores/locos';

// import SelectComponent from '@/components/SelectComponent.vue';
const locoStore = useLocoStore();

const route = useRoute();
const router = useRouter();
console.log(route.params);
const script = ref(automationList.get(Number(route.params.id)));

const description = ref(script.value?.description || '');

const emit = defineEmits<{
    (e: 'selectLoco', id: number, type: AutomationType): void;
}>();

watch(
    () => route.params,
    () => {
        console.log(route.params);
        script.value = automationList.get(Number(route.params.id));
    }
);

watch(script, (newScript) => {
    if (newScript) {
        description.value = newScript.description;
    }
});

const editDescription = ref(false);

const allocateLocoOpen = ref(true);
const availableLocos = computed(() => {
    return locoStore.allLocos
        .filter((value) => {
            const allocatedPID = allocatedLocos.value.get(value.address);
            return allocatedPID === undefined;
        })
        .map((value) => {
            return value.name;
        });
});
const allocateLocoSelect = ref(availableLocos.value[0]);

function runAutomation() {
    if (allocateLocoSelect.value !== 'Select a Train' && script.value) {
        socket.emit(
            'automation/executeAutomation',
            script.value.id,
            allocateLocoSelect.value
        );
        allocateLocoOpen.value = false;
        allocateLocoSelect.value = 'Select a Train';
    }
}
function selectLocoMobile(id?: number, type?: AutomationType) {
    if (id && type) emit('selectLoco', id, type);
}
</script>

<template>
    <div v-if="script" class="flex h-full w-full flex-col justify-between">
        <div class="h-1/3">
            <div
                class="flex flex-col border-b-2 border-primary-300 bg-primary-100 px-1"
            >
                <div class="flex w-full text-lg">
                    <span class="w-5/6">{{ script.name }}</span>
                    <span class="text-md w-1/6 text-right text-primary-600"
                        >#{{ script.id }}</span
                    >
                </div>
                <p class="text-sm italic text-primary-600">
                    {{ script.type }}
                </p>
            </div>
            <div v-if="!editDescription" class="w-full px-1 pt-1">
                <button
                    class="float-right h-full"
                    @click="editDescription = true"
                >
                    <!-- Edit icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        class="fill-primary-600"
                        viewBox="0 0 16 16"
                    >
                        <path
                            d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
                        />
                        <path
                            fill-rule="evenodd"
                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                        />
                    </svg>
                </button>
                <p class="px-0.5 pt-0.5">
                    {{ script.description }}
                </p>
            </div>
            <div
                v-if="editDescription"
                class="flex h-full flex-col rounded-lg px-1 pt-1"
            >
                <textarea
                    v-model="description"
                    class="h-full w-full resize-none border-2"
                />
                <div class="flex flex-row justify-end space-x-1 pt-1">
                    <button
                        class="rounded border-2 border-primary-400 px-1 hover:bg-accent-100"
                        @click="
                            editDescription = false;
                            if (script) description = script.description;
                        "
                    >
                        Cancel
                    </button>
                    <button
                        class="rounded border-2 border-accent-400 bg-accent-400 px-1 hover:bg-accent-300"
                        @click="
                            editDescription = false;
                            if (script) script.description = description;
                            if (script)
                                socket.emit(
                                    'automation/setDescription',
                                    script.id,
                                    script.description
                                );
                        "
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
        <!-- Bottom bar for mobile -->
        <div
            class="flex w-full items-center justify-around border-t-2 border-primary-300 py-1 md:hidden"
        >
            <!-- Back Icon -->
            <button
                class="group flex h-7 w-2/12 items-center rounded-full hover:bg-primary-200 active:bg-accent-400"
                @click="router.push('/automations')"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="h-8 w-full group-hover:fill-accent-400"
                    viewBox="0 0 16 16"
                >
                    <path
                        fill-rule="evenodd"
                        d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
                    />
                </svg>
            </button>
            <!-- Play Icon -->
            <button
                v-if="script.type !== AutomationType.sequence"
                class="group flex h-7 w-1/6 items-center rounded-full hover:bg-primary-200 active:bg-green-400"
                @click="selectLocoMobile(script?.id, script?.type)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    class="h-7 w-full group-hover:fill-green-400"
                >
                    <path
                        d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"
                    />
                </svg>
            </button>
            <!-- Delete Icon -->
            <button
                class="group flex h-7 w-1/6 items-center rounded-full hover:bg-primary-200 active:bg-red-400"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="h-5 w-full group-hover:fill-red-500"
                    viewBox="0 0 16 16"
                    @click="
                        if (script)
                            socket.emit(
                                'automation/deleteAutomation',
                                script.id
                            );
                        router.back();
                    "
                >
                    <!-- height="20" -->
                    <path
                        d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
                    />
                </svg>
            </button>
        </div>
        <!-- Bottom bar for desktop -->
        <div
            class="hidden w-full items-center justify-around border-t-2 border-primary-300 py-1 md:flex"
        >
            <div
                v-if="script.type === AutomationType.automation"
                class="flex w-1/2 rounded border-2"
            >
                <span class="flex w-full justify-center">
                    <!-- <SelectComponent v-model:selected=" allocateLocoSelect " class="h-7 w-full"
                        :options=" availableLocos " /> -->
                    <SelectComponent
                        @update:selected="
                            (newValue) => (allocateLocoSelect = newValue)
                        "
                        :selected="allocateLocoSelect"
                        class="h-7 w-full"
                        :options="availableLocos"
                    />
                </span>
                <button
                    class="group flex h-7 w-7 items-center rounded-full hover:bg-primary-200 active:bg-green-400"
                    @click="runAutomation()"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        class="h-7 w-full group-hover:fill-green-400"
                    >
                        <path
                            d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"
                        />
                    </svg>
                </button>
            </div>
            <button
                v-if="script.type === AutomationType.route"
                class="group flex h-7 w-1/12 items-center rounded-full hover:bg-primary-200 active:bg-red-400"
                @click="runAutomation()"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    class="h-7 w-full group-hover:fill-green-400"
                >
                    <path
                        d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"
                    />
                </svg>
            </button>
            <button
                class="group flex h-7 w-1/12 items-center rounded-full hover:bg-primary-200 active:bg-red-400"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="h-5 w-full group-hover:fill-red-500"
                    viewBox="0 0 16 16"
                    @click="
                        if (script)
                            socket.emit(
                                'automation/deleteAutomation',
                                script.id
                            );
                        router.back();
                    "
                >
                    <path
                        d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>
