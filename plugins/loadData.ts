import { useLocoStore } from '~/stores/locos';
import { socket } from '~/utils/socketHelper';
import { Loco } from '@trainlink-org/shared-lib';

export default defineNuxtPlugin((nuxtApp) => {
    console.log('Inside plugin');
});
