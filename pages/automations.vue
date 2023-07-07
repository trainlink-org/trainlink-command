<script setup lang="ts">
// import { computed, ref, reactive, getCurrentInstance, onMounted, onUnmounted, watch } from 'vue';
// import { useRoute, useRouter } from 'vue-router';

// import { socket } from '@/utils/socketHelper';

import {
    AutomationType,
    type RunningAutomationClient,
    AutomationStatus,
} from '@trainlink-org/trainlink-types';
import {
    allocatedLocos,
    automationList,
    runningAutomations,
} from '@/utils/main';

import { useLocoStore } from '~/stores/locos';
import { useSocketStore } from '@/stores/socket';
const locoStore = useLocoStore();
// import ModalComponent from '../components/ModalComponent.vue';
// import SelectComponent from '../components/SelectComponent.vue';

// const file: Ref<FileList> = ref<FileList>(new FileList());
// let files: FileList;

const socket = useSocketStore().socketRef;

const instance = getCurrentInstance();

const validFile = ref(true);

const router = useRouter();

const fileInputClasses = computed(() => {
    return validFile.value
        ? ''
        : 'file:border-solid file:border-red-500 file:rounded';
});

function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.files && target.files.length !== 0) {
        validFile.value = true;
    }
}

async function sendFile() {
    if (instance) {
        const fileInput: HTMLInputElement = instance.refs
            .fileInput as HTMLInputElement;
        if (fileInput.files && fileInput.files.length !== 0) {
            console.log(fileInput.files);
            // fileInput.value = '';
            for (const file of fileInput.files) {
                socket.emit(
                    'automation/fileUpload',
                    file.name,
                    await file.text()
                );
                console.log(file.name, await file.text());
            }
            clearFileInput();
            fileUploadOpen.value = false;
            validFile.value = true;
            // socket.emit('automation/fetchAll');
        } else {
            console.log('Please select a file');
            validFile.value = false;
        }
    }
}

function clearFileInput() {
    const fileInput: HTMLInputElement = instance?.refs
        .fileInput as HTMLInputElement;
    if (fileInput.files && fileInput.files.length !== 0) {
        fileInput.value = '';
    }
}

const allocateLocoOpen = ref(false);
const allocateLocoSelect = ref('Select a Train');
const availableLocos = computed(() => {
    // return Array.from(store.getAllLocos())
    return locoStore.allLocos
        .filter((value) => {
            const allocatedPID = allocatedLocos.value.get(value.address);
            return allocatedPID === undefined;
        })
        .map((value) => {
            return value.name;
        });
});

const automationID = ref(-1);
// const availableLocos = computed(() => {
//     return Array.from(store.getAllLocos()).map((value) => {
//         return value.name;
//     });
// });

function selectLoco(id: number, type: AutomationType) {
    if (type === AutomationType.automation) {
        automationID.value = id;
        allocateLocoOpen.value = true;
    } else {
        socket.emit('automation/executeAutomation', id);
    }
}

function runAutomation() {
    if (allocateLocoSelect.value !== 'Select a Train') {
        socket.emit(
            'automation/executeAutomation',
            automationID.value,
            allocateLocoSelect.value
        );
        allocateLocoOpen.value = false;
        allocateLocoSelect.value = 'Select a Train';
    }
}

const fileUploadOpen = ref(false);

onMounted(() => {
    socket.emit('automation/fetchAll');
    socket.emit('automation/fetchRunning');
});

const detailsOpen = ref(false);
const smallScreen = ref(false);

if (process.client) {
    const windowWidth = ref(window.innerWidth);

    const onWidthChange = () => {
        windowWidth.value = window.innerWidth;
        if (windowWidth.value >= 768) {
            smallScreen.value = false;
        } else {
            smallScreen.value = true;
        }
    };
    onMounted(() => {
        window.addEventListener('resize', onWidthChange);
        if (windowWidth.value >= 768) {
            smallScreen.value = false;
        } else {
            smallScreen.value = true;
        }
    });
    onUnmounted(() => window.removeEventListener('resize', onWidthChange));
}

const route = useRoute();

watch(route, (newRoute) => {
    if (newRoute.fullPath === '/automations') {
        detailsOpen.value = false;
    }
});

function generateTitle(automation: RunningAutomationClient) {
    // return new Promise<string>((resolve) => {
    //     if ((automation.type === AutomationType.Automation || automation.type === AutomationType.Sequence) && automation.locoAddress) {
    //         store.getLoco(automation.locoAddress).then((loco) => {
    //             if (loco.name) {
    //                 resolve(`${automation.name} - ${loco.name}`);
    //             } else {
    //                 resolve(automation.name);
    //             }
    //         });
    //     } else {
    //         resolve(automation.name);
    //     }
    // });
    return automation.name;
    // return 'Test name';
}

const processingErrorModal = reactive({
    open: false,
    title: '',
    details: '',
    location: '',
});

socket.on('automation/processingError', (error) => {
    console.warn(error);
    processingErrorModal.title = error.type;
    processingErrorModal.details = error.message;
    processingErrorModal.location = error.location || '';
    processingErrorModal.open = true;
});

const testString = ref('');
</script>

<template>
    <div class="flex h-full w-full items-center justify-evenly pt-10">
        <!-- <input
            id="fileUpload"
            type="file"
            name="fileUpload"
            accept=".h"
            @change="handleFileUpload($event)"
        >
        <button @click="sendFile">
            Send file
        </button> -->
        <div
            v-if="!detailsOpen || !smallScreen"
            class="h-5/6 w-11/12 overflow-y-scroll rounded-lg border-4 border-borderColor-300 sm:w-5/6 md:w-3/12"
        >
            <div class="w-full bg-primary-300 pl-2 pr-3 text-lg">Running</div>
            <ul>
                <li
                    v-for="automation in Array.from(
                        runningAutomations.values()
                    )"
                    :key="automation.pid.toString()"
                    class="w-full cursor-pointer pl-2 pr-3 hover:bg-green-100"
                >
                    <div
                        class="group grid w-full grid-flow-row grid-cols-5 grid-rows-2"
                        @click="
                            router.push('/automations');
                            router.push(
                                '/automations/running/' +
                                    automation.pid.replace('#', '-')
                            );
                            detailsOpen = true;
                        "
                    >
                        <p class="col-span-4 lg:text-lg">
                            {{ generateTitle(automation) }}
                            <!-- {{ automation.name }} -->
                        </p>
                        <div
                            class="flex h-full w-full items-center justify-end"
                        >
                            <!-- Pause Icon -->
                            <svg
                                v-if="
                                    automation.status ===
                                    AutomationStatus.running
                                "
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="currentColor"
                                class="invisible h-6 fill-primary-400 hover:fill-blue-400 group-hover:visible"
                                viewBox="0 0 16 16"
                                @click="
                                    (event) => {
                                        socket.emit(
                                            'automation/pauseAutomation',
                                            automation.pid
                                        );
                                        event.stopPropagation();
                                    }
                                "
                            >
                                <path
                                    d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"
                                />
                            </svg>
                            <!-- Play Icon -->
                            <svg
                                v-if="
                                    automation.status ===
                                    AutomationStatus.paused
                                "
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="currentColor"
                                class="invisible row-span-2 h-6 fill-primary-400 hover:fill-green-400 group-hover:visible"
                                viewBox="0 0 16 16"
                                @click="
                                    (event) => {
                                        socket.emit(
                                            'automation/resumeAutomation',
                                            automation.pid
                                        );
                                        event.stopPropagation();
                                    }
                                "
                            >
                                <path
                                    d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"
                                />
                            </svg>
                            <!-- Stop Icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="currentColor"
                                class="invisible h-6 fill-primary-400 hover:fill-red-400 group-hover:visible"
                                viewBox="0 0 16 16"
                                @click="
                                    socket.emit(
                                        'automation/stopAutomation',
                                        automation.pid
                                    )
                                "
                            >
                                <path
                                    d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"
                                />
                            </svg>
                        </div>
                        <p class="col-span-3 text-sm italic">
                            {{ automation.status }}
                        </p>
                        <!-- <p class="text-right">
                            PID
                        </p> -->
                        <p class="col-span-2 text-right">
                            {{ automation.pid }}
                        </p>
                    </div>
                </li>
            </ul>
            <div
                v-if="runningAutomations.size === 0"
                class="w-full py-2 text-center text-sm italic"
            >
                Nothing running right now
            </div>
            <div
                class="flex w-full items-center justify-between bg-primary-300 pl-2 pr-3 text-lg"
            >
                <p>Available</p>
                <!-- Bootstrap icon: plus -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="currentColor"
                    class="fill-primary-600 hover:fill-accent-500"
                    viewBox="0 0 16 16"
                    @click="fileUploadOpen = true"
                >
                    <path
                        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                    />
                </svg>
            </div>
            <div
                v-if="fileUploadOpen"
                class="flex flex-col border-b-4 border-b-primary-300 bg-primary-100 pl-2 pr-3"
            >
                <p class="">Upload a script:</p>
                <input
                    ref="fileInput"
                    type="file"
                    class="text-sm"
                    :class="fileInputClasses"
                    accept=".h"
                    @change="handleFileUpload($event)"
                />
                <div class="mb-1 flex justify-end space-x-1 justify-self-end">
                    <button
                        class="rounded border-2 border-primary-400 px-1 hover:bg-accent-100"
                        @click="
                            fileUploadOpen = false;
                            clearFileInput();
                        "
                    >
                        Cancel
                    </button>
                    <button
                        class="rounded border-2 border-accent-400 bg-accent-400 px-1 hover:bg-accent-300"
                        @click="sendFile"
                    >
                        Send file
                    </button>
                </div>
            </div>
            <ul>
                <li
                    v-for="script of Array.from(automationList.values()).filter(
                        (value) => {
                            return value.type !== AutomationType.sequence;
                        }
                    )"
                    :key="script.id"
                    class="w-full cursor-pointer pl-2 pr-3 hover:bg-primary-200 active:bg-primary-200"
                >
                    <div
                        class="group grid w-full grid-flow-row auto-rows-min grid-cols-5"
                        @click="
                            router.push('/automations');
                            router.push('/automations/script/' + script.id);
                            detailsOpen = true;
                        "
                    >
                        <p class="col-span-4 lg:text-lg">
                            {{ script.name }}
                            <span class="italic text-primary-600">
                                {{ script.type }}
                            </span>
                        </p>
                        <div
                            class="flex h-full w-full items-center justify-end"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="currentColor"
                                class="invisible row-span-2 h-6 fill-primary-400 hover:fill-green-400 group-hover:visible"
                                viewBox="0 0 16 16"
                                @click="
                                    (event) => {
                                        selectLoco(script.id, script.type);
                                        event.stopPropagation();
                                    }
                                "
                            >
                                <path
                                    d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"
                                />
                            </svg>
                        </div>
                        <p class="col-span-5 truncate text-sm italic">
                            {{ script.description }}
                        </p>
                    </div>
                </li>
            </ul>
            <div
                v-if="automationList.size !== 0"
                class="w-full bg-primary-300 pl-2 pr-3"
            >
                Others
            </div>
            <ul>
                <li
                    v-for="script of Array.from(automationList.values()).filter(
                        (value) => {
                            return value.type === AutomationType.sequence;
                        }
                    )"
                    :key="script.id"
                    class="w-full cursor-pointer pl-2 pr-3 hover:bg-primary-200"
                >
                    <div
                        class="group grid w-full grid-flow-row auto-rows-min grid-cols-5"
                        @click="
                            router.push('/automations');
                            router.push('/automations/script/' + script.id);
                            detailsOpen = true;
                        "
                    >
                        <p class="col-span-4 lg:text-lg">
                            {{ script.name }}
                            <span class="italic text-primary-600">
                                {{ script.type }}
                            </span>
                        </p>
                        <!-- <div class="flex h-full w-full items-center justify-end">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="currentColor"
                                class="invisible row-span-2 h-6 fill-primary-400 hover:fill-green-400 group-hover:visible"
                                viewBox="0 0 16 16"
                            >
                                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                            </svg>
                        </div> -->
                        <p class="col-span-5 truncate text-sm italic">
                            {{ script.description }}
                        </p>
                    </div>
                </li>
            </ul>
        </div>
        <div
            v-if="detailsOpen || !smallScreen"
            class="h-5/6 w-11/12 rounded-lg border-4 md:w-4/6"
        >
            <RouterView
                @select-loco="(id: number, type: AutomationType) => selectLoco(id, type)"
            />
        </div>
        <div
            class="absolute bottom-0 left-0 mb-2 ml-2 h-10 w-10 rounded-full border-2 border-borderColor-300 bg-primary-200 p-1 pl-2 focus:bg-accent-400"
            @click="router.push('/throttle/jump')"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                class="h-full w-full"
                viewBox="0 0 16 16"
            >
                <!-- <path
                    fill-rule="evenodd"
                    d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8zm-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5z"
                /> -->
                <path
                    fill-rule="evenodd"
                    d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5zM10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5z"
                />
            </svg>
        </div>
    </div>
    <ModalComponent
        v-if="allocateLocoOpen"
        title="Some text"
        submit-text="Run"
        @cancel="allocateLocoOpen = false"
        @submit="runAutomation()"
    >
        <!-- <SelectComponent v-model:selected=" allocateLocoSelect " :options=" availableLocos " /> -->
        <SelectComponent
            @update:selected="(value) => (allocateLocoSelect = value)"
            :selected="allocateLocoSelect"
            :options="availableLocos"
        />
    </ModalComponent>
    <ModalComponent
        v-if="processingErrorModal.open"
        :title="processingErrorModal.title"
        submit-text="Close"
        cancel-text="_hidden_"
        @submit="processingErrorModal.open = false"
        @cancel="processingErrorModal.open = false"
    >
        {{ processingErrorModal.details }}
        <br />
        {{ processingErrorModal.location }}
    </ModalComponent>
</template>
