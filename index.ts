import Element from './src/Element.js';
import Screen from './src/Screen.js';

const scr = new Screen();
const e = new Element({
    screen: scr,
    width: '100%'
});
console.log(e);