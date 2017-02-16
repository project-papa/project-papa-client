import { keyboardInput } from 'src/keyboard';
document.addEventListener('keydown', keyboardInput);

import { World } from './world';

(new World()).start();
