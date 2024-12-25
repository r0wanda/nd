# Screen (from [Node](./Node.md))
## Options
* resizeTimeout - Time (in milliseconds) to wait before updating screen contents after resize
    * Default: 300ms
* disableChecks - Disable all terminal checks (eg. interactive, colors) **(not recommended)**
* interactive - Override interactive check **(not recommended)** (Default: true)
* bitDepth - Manually set terminal color depth **(not recommended)**
* hideCursor - Whether or not to hide the cursor
* stdout - Manually set stream for stdout
    * Aliases: output
* stdin - Manually set stream for stdin
    * Aliases: input
* fullScreen - Whether or not to enter the alternative screen
* dockBorders - Whether or not to dock borders

*This may have an impact on performance, especially on slower devices.*\
For example, these overlapping borders
```
 ┌─────────┌─────────┐
 │ box1    │ box2    │
 └─────────└─────────┘
```
 Will become these docked borders
```
 ┌─────────┬─────────┐
 │ box1    │ box2    │
 └─────────┴─────────┘
```
* ignoreDockContrast - Docked borders will be ignored when the colors are different. This forces them to dock anyways, possibly resulting in some weird multi-colored borders.