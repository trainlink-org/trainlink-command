<template>
    <div class="h-full relative">
        <Codemirror
            v-model="code"
            placeholder="Code goes here..."
            :style="{ height: '100%' }"
            :autofocus="true"
            :indent-with-tab="true"
            :tab-size="2"
        />
        <ButtonComponent
            class="absolute bottom-0 right-0 m-2 bg-accent-400 border-accent-400 hover:bg-accent-300"
            >Save</ButtonComponent
        >
    </div>
</template>

<script setup lang="ts">
import { EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { Codemirror } from 'vue-codemirror';
const code = ref(`console.log('Hello, world!')`);
</script>
