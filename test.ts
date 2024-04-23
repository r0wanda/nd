import nd from './index.js'
const tm = () => {
    const h = process.hrtime();
    return Math.round(h[0] * 1e6 + h[1] / 1000);
}
const s = tm();
const scr = new nd.Screen();
let t = tm();
const el = new nd.Box({
    fg: 'red',
    bg: 'green',
    bold: true,
    underline: true,
    content: `{center}{magenta-fg}hello {/bold}world{/magenta-fg}{/center}\n{left}{blue-bg}left{/blue-bg}{/left}\n{right}right{/right}\n{red-bg}left seperator{|}right seperator{/red-bg}${'\n'.repeat(50)}hi`,
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
console.error(`box in ${tm()-t}μs`);
t = tm();
const ln = new nd.Line({
    screen: scr,
    orientation: 'v',
    height: '100%',
    top: 0,
    left: '50%',
    lineType: 'double'
});
ln.focus();
console.error(`line in ${tm()-t}μs`);
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
t = tm();
scr.render();
console.error(`render in ${tm()-t}μs`)
console.error(`done in ${tm()-s}μs`)
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

