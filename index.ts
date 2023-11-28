import Element from './src/Element.js';
import Screen from './src/Screen.js';

const scr = new Screen();
const el = new Element({
    fg: 'red',
    bg: 'green',
    content: '{center}{magenta-fg}hello world{/magenta-fg}{/center}{left}{blue-bg}left{/blue-bg}{/left}\n{right}right{/right}\n{red-bg}left seperator{|}right seperator{/red-bg}',
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

