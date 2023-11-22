import Element from './src/Element.js';
import Screen from './src/Screen.js';

const scr = new Screen();
new Element({
    fg: 'red',
    bg: 'green',
    content: 'hello world',
    screen: scr,
    width: '50%',
    height: '50%',
    left: '10%',
    top: '10%',
});
scr.render();
scr.key(['C-c'], (ch, key) => {
    process.exit();
})
scr.key('*', (ch, key) => {
    console.log(ch, key);
}, {
    glob: false
})
/*import Keys from './src/Keys.js';
import { type Key } from './src/Keys.js';
Keys.enableMouse();
Keys.emitKeypressEvents(process.stdin);
process.stdin.on('keypress', (ch: string, key: Key) => {
    console.log(ch, key);
    if (key && key.ctrl && key.name == 'c') {
        Keys.disableMouse();
        process.stdin.pause();
    }
});
process.stdin.setRawMode(true);
process.stdin.resume();*/