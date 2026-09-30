import type { PartGuide } from '@/lib/parts/types';

/** LEDs, the buzzer, and the parts you press, turn or shine light on. */

export const led: PartGuide = {
  id: 'led-5mm',
  drawing: 'led',
  symbol: 'led',
  guidedPartId: 'led-5mm-red',
  polarity: 'polarized',
  pins: [
    { name: 'Anode (+)', role: 'anode', note: 'The long leg. Connects toward the pin or power, through a resistor.' },
    { name: 'Cathode (−)', role: 'cathode', note: 'The short leg, next to the flat edge. Connects toward GND.' },
  ],
  pinOrder: 'none',
  callouts: [
    { at: 'long-leg', text: 'Long leg: the anode (+). This side goes toward the pin, through a resistor.' },
    { at: 'short-leg', text: 'Short leg: the cathode (−). This side goes to GND.' },
    { at: 'flat-edge', text: 'Flat edge on the rim: it marks the cathode, which helps when the legs have been trimmed.' },
  ],
};

export const rgbLed: PartGuide = {
  id: 'led-rgb-cc',
  drawing: 'rgb-led',
  symbol: null,
  symbolNote: 'An RGB LED is three LEDs in one dome. Circuits draw it as three LED symbols sharing one connection.',
  what: 'Three LEDs (red, green and blue) in one dome, so it can mix any colour.',
  spot: 'A clear 5 mm dome with four legs. The longest leg is the shared one.',
  watch: 'This is a common-cathode part: the long leg goes to GND. A common-anode RGB LED works the opposite way round. Each colour needs its own resistor.',
  polarity: 'polarized',
  pins: [
    { name: 'Red', role: 'anode', note: 'Connects through a resistor to a pin.' },
    { name: 'Common (−)', role: 'common', note: 'The longest leg. Connects to GND on a common-cathode part.' },
    { name: 'Green', role: 'anode', note: 'Connects through a resistor to a pin.' },
    { name: 'Blue', role: 'anode', note: 'Connects through a resistor to a pin.' },
  ],
  pinOrder: 'standard',
  callouts: [
    { at: 'red-leg', text: 'Red, on the outside next to the flat side.' },
    { at: 'common-leg', text: 'Common: the longest leg, second from the flat side. It goes to GND.' },
    { at: 'green-leg', text: 'Green.' },
    { at: 'blue-leg', text: 'Blue.' },
  ],
};

export const buzzer: PartGuide = {
  id: 'buzzer-active',
  drawing: 'buzzer',
  symbol: null,
  symbolNote: 'Buzzers are drawn in several ways, so this guide does not show one.',
  what: 'Makes a beep when you power it. It makes the tone itself, so plain on and off is enough.',
  spot: 'A black cylinder about 12 mm wide with a + mark, a small hole on top and a sealed underside.',
  watch: 'A passive buzzer looks similar but is usually open underneath (you can see a green circuit board) and needs a tone signal from code.',
  polarity: 'polarized',
  pins: [
    { name: 'Positive (+)', role: 'power', note: 'The longer leg, next to the + mark. Connects to the pin.' },
    { name: 'Negative (−)', role: 'ground', note: 'The shorter leg. Connects to GND.' },
  ],
  pinOrder: 'none',
  callouts: [
    { at: 'plus-mark', text: 'The + mark shows the positive side.' },
    { at: 'sound-hole', text: 'Sound hole on top.' },
    { at: 'long-leg', text: 'Long leg: positive (+).' },
  ],
};

export const pushButton: PartGuide = {
  id: 'push-button',
  drawing: 'push-button',
  symbol: 'switch',
  what: 'A switch that connects two points only while it is pressed.',
  spot: 'A small square black button, about 6 mm, with four legs.',
  watch: 'Two legs are always joined inside the button. Connect diagonally opposite legs so that pressing it completes the circuit.',
  polarity: 'either',
  pins: [
    { name: 'Leg A', role: 'passive', note: 'One of a pair joined inside.' },
    { name: 'Leg B', role: 'passive', note: 'The other pair. Pressing joins the two pairs.' },
  ],
  pinOrder: 'none',
  callouts: [
    { at: 'cap', text: 'The cap: press here to close the switch.' },
    { at: 'leg-top-left', text: 'Use this leg and the diagonally opposite one (bottom right).' },
    { at: 'leg-bottom-right', text: 'The diagonal partner of the first leg.' },
  ],
};

export const potentiometer: PartGuide = {
  id: 'potentiometer-10k',
  drawing: 'potentiometer',
  symbol: 'potentiometer',
  what: 'A knob you turn to change how much resistance sits between its middle leg and its outer legs.',
  spot: 'A rotary part with three legs in a row, often blue or white, with a knob or a screw slot on top.',
  watch: 'Connect the outer legs to 5V and GND and read the middle leg. Swapping the outer legs reverses which way is "up".',
  polarity: 'either',
  pins: [
    { name: 'Outer leg 1', role: 'passive', note: 'One end of the track. Connects to 5V or GND.' },
    { name: 'Wiper (middle)', role: 'output', note: 'Gives a voltage between 0 and 5 V as you turn. Connects to an analog pin.' },
    { name: 'Outer leg 2', role: 'passive', note: 'The other end of the track.' },
  ],
  pinOrder: 'standard',
  callouts: [
    { at: 'knob', text: 'Knob: turn it to change the reading.' },
    { at: 'outer-left', text: 'Outer leg: one end of the track (5V or GND).' },
    { at: 'wiper', text: 'Middle leg, the wiper: this is the one you read.' },
    { at: 'outer-right', text: 'Outer leg: the other end of the track.' },
  ],
};

export const ldr: PartGuide = {
  id: 'ldr',
  drawing: 'ldr',
  symbol: 'ldr',
  what: 'A light sensor: its resistance drops as more light falls on it.',
  spot: 'A small flat disc about 5 mm wide with a wavy zig-zag track on its face and two long legs.',
  watch: 'It only changes resistance, so it needs a fixed resistor beside it to make a voltage the board can read. Either leg can go either way.',
  polarity: 'either',
  pins: [
    { name: 'Leg 1', role: 'passive' },
    { name: 'Leg 2', role: 'passive', note: 'Either leg can go either way round.' },
  ],
  pinOrder: 'none',
  callouts: [
    { at: 'face', text: 'The wavy track: light falling here lowers the resistance.' },
    { at: 'leg-left', text: 'Leg: not polarised.' },
    { at: 'leg-right', text: 'Leg: not polarised.' },
  ],
};
