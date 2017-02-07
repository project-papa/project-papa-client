import { add } from 'src/lib';
import { addBox } from 'src/box';

console.log(`5 + 7 is ${add(5, 7)}`);

// Add a cube to scene:
addBox(1, 1, 1, 0x00ff00);
