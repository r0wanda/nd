import nd from './index.js'
const s = Date.now();
const scr = new nd.Screen();
const el = new nd.Box({
    fg: 'red',
    bg: 'green',
    content: `{center}{magenta-fg}hello world{/magenta-fg}{/center}\n{left}{blue-bg}left{/blue-bg}{/left}\n{right}right{/right}\n{red-bg}left seperator{|}right seperator{/red-bg}${'\n'.repeat(50)}hi`,
    screen: scr,
    width: '50%',
    height: '50%',
    left: '0%',
    top: '0%',
    border: {
        type: 'line'
    },
    style: {
        hover: {
            bg: 'brown'
        }
    }
});
const ln = new nd.Line({
    screen: scr,
    orientation: 'v',
    height: '100%',
    top: 0,
    left: '50%',
    lineType: 'double'
});
ln.focus();
/*new nd.Element({
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
        lineType: 'double'
    }
});*/
scr.render();
const e = Date.now();
console.error(`processed in ${e-s}ms`)
scr.key(['esc*', 'q', 'C-c'], () => {
    process.exit();
});
el.key('h', () => {
    el.height = '40%';
    scr.render();
});
el.key('u', () => {
    el.height = '50%';
    scr.render();
});

