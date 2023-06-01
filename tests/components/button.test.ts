import { describe, expect, test } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';
import { mount } from '@vue/test-utils';

import ButtonComponent from 'components/ButtonComponent.vue';

describe('A test', async () => {
    // await setup({ server: false });

    test('mount component', () => {
        expect(ButtonComponent).toBeTruthy();

        const wrapper = mount(ButtonComponent, {
            slots: {
                default: 'Test text',
            },
        });
        expect(wrapper.text()).toContain('Test text');
    });
});
