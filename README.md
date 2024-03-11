# ND: New Designs

**New Designs** aims to replace [blessed](https://github.com/chjj/blessed) with a maintained, **new**, Typescript-based program. It tries to stay close to the blessed api, to avoid the need to change too much user-code.

TODO: add gif

# Install
Npm:
```sh
npm i git+https://github.com/r0wanda/nd.git # todo: publish to npm
```
Yarn:
```sh
yarn add git+https://github.com/r0wanda/nd.git
```
# Example
```js
import nd from 'nd';

// Instantiate a screen class
const screen = new nd.Screen();

// Set window title (on some terminal emulators, may do nothing)
screen.title = 'my window title';

const box = new nd.Element({
    screen: screen, // One difference from blessed, screen is set at creation

    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    content: 'Hello {bold}world{/bold}!',
    tags: true, // Not required, tags is default now
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'magenta',
        border: {
            fg: '#f0f0f0' // Unlike blessed, this will be truecolor if supported!
        },
        hover: {
            bg: 'green',
        }
    }
});

// Quit on escape (using blob!), q, or Control-C
screen.key(['esc*', 'q', 'C-c'], (ch, key) => {
    process.exit(0);
});

screen.render();
```