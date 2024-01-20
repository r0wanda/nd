import Keys from "./src/Keys.js";

Keys.emitKeypressEvents();
Keys.enableMouse();
process.stdin.setRawMode(true);
process.stdin.resume();
// @ts-ignore
process.stdin.on('keypress', (ch, key) => {
    console.log(ch, key)
    if (ch === 'h') {
        Keys.disableMouse();
        process.stdin.pause();
        process.exit(0);
    }
})
process.stdin.on('click', (x: number, y: number) => {
    console.log([x, y])
});
