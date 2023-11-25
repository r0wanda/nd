import Element from './src/Element.js';
import Screen from './src/Screen.js';

const scr = new Screen();
const el = new Element({
    fg: 'red',
    bg: 'green',
    content: '{center}hello world{/center}\n{left}left{/left}\n{right}right{/right}',
    screen: scr,
    width: '50%',
    height: '50%',
    left: '10%',
    top: '10%',
});
scr.render();
scr.key(['esc*', 'q', 'C-c'], () => {
    process.exit();
});
scr.key('h', () => {
    el.height = '40%';
    scr.render();
});
scr.key('u', () => {
    el.height = '50%';
    scr.render();
});

