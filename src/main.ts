import { keyboardInput } from './keyboard';
document.addEventListener('keydown', keyboardInput);

import './MyoInterface';
import { World } from './world';

(new World()).start();
