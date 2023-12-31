import nd from './index.js'
const s = Date.now();
const scr = new nd.Screen();
const el = new nd.Element({
    fg: 'red',
    bg: 'green',
    content: '{center}{magenta-fg}hello world{/magenta-fg}{/center}{left}{blue-bg}left{/blue-bg}{/left}\n{right}right{/right}\n{red-bg}left seperator{|}right seperator{/red-bg}',
    screen: scr,
    width: '50%',
    height: '50%',
    left: '10%',
    top: '10%',
    border: {
        type: 'line'
    }
});
new nd.Element({
    fg: 'black',
    bg: 'blue',
    content: 'left─sep─era─tor{|}right seperator{/red-bg}',
    screen: scr,
    width: '50%',
    height: '50%',
    left: '20%',
    top: '20%',
    border: {
        type: 'line',
        lineType: 'heavy'
    }
});
scr.render();
const e = Date.now();
console.error(`processed in ${e-s}ms`)
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

