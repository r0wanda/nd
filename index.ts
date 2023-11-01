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