# mosaic
Website to create downloadable tessellations

Hi! Welcome to Mosaic. Mosaic is a webapp written using the p5.js library designed to allow for users to create interactive algorithm art. Depending on the user inputs, Mosaic can make cool images like these:


Of course, Mosaic is currently set up to make very structured tessellations, and shifts in color only move along the x-axis. Mosaic could be rewritten to include non-uniform tessellations, color changes along the y-axis, or whatever you like. I'm always looking for ways to improve the tool, so please write me with any of your ideas or ideas for collaboration! The most recent stable version is [here](https://bwedin.github.io/mosaic/index.html) for anyone to freely use. The rest of this readme is targeted to developers who'd like to modify Mosaic for their own purposes.

## Parameters/controls

There are many different parameters that feed into Mosaic, so let's enumerate these.

Visualization parameters:
**Shape**: Sets the base shape used to draw inside the visualization. Current options are diamond, triangle, and square.
**Refresh rate**: How frequently the main visualization will try to update (note, performance speed generally speeds down with a higher number of columns, and thus this refresh rate becomes less precise).
**Columns**: Number of columns drawn across the x-axis (the view will add an additional column if necessary). This number pertains to the number of times a shape in the same y position will be drawn across, so the diamond and triangle tessellations end up drawing almost twice as many shapes as the squares! 
**Colorsets**: Colorsets are the sets of colors that are fed into the visualization. Currently, the maximum number of colorsets possible is 5.
**Colorset proportions**: Directly below the visualization, knobs that control the probability of a given colorset being displayed at that x position. Multiple colorsets can be set to "100", so the associated numeric value of probability is relative, not absolute. Interactivity is handled by the clickableObjects array, whereas view is controlled by shapesToDraw.
**Colors**: The colors that make up a given colorset. Any given color has an equal probability of being chosen. Currently, the maximum numbers inside a single colorset is 8.
**Smoothing**: How much the color of a shape is dependent on the previous frame. If set to 1, no prior information is used to determine color. If 2 or greater, ```historyFraction=(1/<SMOOTHING>)``` and the new shape's color is ```newColor=(oldColor*historyFraction)+(newColor*(1-historyFraction))``` for the r, g, and b values separately.

The following are not fed into the visualization, but still affect the user experience:
**Presets**: Preset visualizations that when selected, will change the overall visualization. For examples of how these views are generated programmatically, check out the setupPresetView function.
**Auto-Mosaic**: Randomly changes one of the above visualization parameters (or selects a preset) every set amount of time (currently 10 seconds). For the list of possible changes, check out the generateAutoMosaic function.
**Freeze**: Freezes the visualization.
**Refreshes**: Generates a new frame for the visualization and displays it (also resets refresh timer).
**Fullscreen**: Sets the visualization to fullscreen.
**Save image**: Generates an additional frame, and uses this frame as output to an exported 'mosaic.png' file.


## Setup/Draw

The visualization is setup using the setup() function, and then looped using the draw() function.
