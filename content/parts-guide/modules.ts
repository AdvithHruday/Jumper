import type { PartGuide } from '@/lib/parts/types';

/**
 * Sensor and display modules. Makers of these boards are not consistent about
 * pin order, so where it differs the guide lists pins by function and sets
 * `pinOrder: 'varies'`; the page then tells the reader to trust the labels
 * printed on their own board.
 */

export const hcsr04: PartGuide = {
  id: 'hc-sr04',
  drawing: 'hc-sr04',
  symbol: null,
  symbolNote: 'Sensor modules are drawn as a labelled box in circuit diagrams.',
  what: 'Measures distance by sending out a burst of ultrasound and timing the echo.',
  spot: 'A blue board with two silver cylinders that look like eyes, and four pins along the bottom edge.',
  watch: 'It runs on 5 V and its Echo pin sends back 5 V. An ESP32 pin only takes 3.3 V, so use a voltage divider on Echo there.',
  polarity: 'polarized',
  pins: [
    { name: 'VCC', role: 'power', note: 'Connects to 5V.' },
    { name: 'Trig', role: 'input', note: 'Your board sends a short pulse here to start a measurement.' },
    { name: 'Echo', role: 'output', note: 'Sends back a pulse whose length is the echo time.' },
    { name: 'GND', role: 'ground', note: 'Connects to GND.' },
  ],
  pinOrder: 'standard',
  callouts: [
    { at: 'transmitter', text: 'The transmitter sends the ultrasound.' },
    { at: 'receiver', text: 'The receiver listens for the echo.' },
    { at: 'pins', text: 'The four pins, left to right as drawn: VCC (5 V power), Trig (your board sends the start pulse here), Echo (the reply comes back here) and GND. Check the labels on yours.' },
  ],
};

export const dht11: PartGuide = {
  id: 'dht11',
  drawing: 'dht11',
  symbol: null,
  symbolNote: 'Sensor modules are drawn as a labelled box in circuit diagrams.',
  what: 'Measures air temperature and humidity and sends both as one digital signal.',
  spot: 'A small blue plastic block with a grid of slots on the front. It comes bare with four legs, or on a small board with three pins.',
  watch: 'Bare sensors have four legs and need a 10 kΩ resistor between VCC and Data; boards with three pins already have it. Read it no more than about once a second.',
  polarity: 'polarized',
  pins: [
    { name: 'VCC', role: 'power', note: 'Connects to 3.3V or 5V.' },
    { name: 'Data', role: 'signal', note: 'Connects to a digital pin.' },
    { name: 'GND', role: 'ground', note: 'Connects to GND.' },
    { name: 'NC', role: 'passive', note: 'Only on the four-leg sensor. It is not connected to anything: leave it empty.' },
  ],
  pinOrder: 'varies',
  callouts: [
    { at: 'sensor', text: 'The sensor block. The slots let air reach the humidity sensor inside.' },
    { at: 'pins', text: 'Pins: read the labels on yours (+, OUT, − or VCC, DATA, GND) because the order differs between boards.' },
  ],
};

export const pir: PartGuide = {
  id: 'pir-hc-sr501',
  drawing: 'pir',
  symbol: null,
  symbolNote: 'Sensor modules are drawn as a labelled box in circuit diagrams.',
  what: 'Detects movement of warm bodies, such as a person walking past, by sensing changes in infrared heat.',
  spot: 'A green board with a white dome on top and two small orange dials, with three pins along one edge.',
  watch: 'It takes about a minute to settle after power-on and may trigger by itself in that time. The dome is fragile: do not press on it.',
  polarity: 'polarized',
  pins: [
    { name: 'VCC', role: 'power', note: 'Connects to 5V.' },
    { name: 'OUT', role: 'output', note: 'Goes HIGH (3.3 V) while movement is detected.' },
    { name: 'GND', role: 'ground', note: 'Connects to GND.' },
  ],
  pinOrder: 'varies',
  callouts: [
    { at: 'lens', text: 'The white dome is a lens that focuses heat onto the sensor.' },
    { at: 'dial-left', text: 'One dial sets how sensitive it is; the other sets how long OUT stays high. Turn them to test.' },
    { at: 'dial-right', text: 'The second dial: read the label printed on your board to see which is which.' },
    { at: 'pins', text: 'Pins: the label sits under the dome on many boards. Check it before you connect anything.' },
  ],
};

export const irLine: PartGuide = {
  id: 'ir-line-sensor',
  drawing: 'ir-line',
  symbol: null,
  symbolNote: 'Sensor modules are drawn as a labelled box in circuit diagrams.',
  what: 'Tells light surfaces from dark ones by bouncing infrared light off the ground, which is how a robot follows a black line.',
  spot: 'A small board with a clear LED and a dark one side by side, one dial, and a row of pins on the opposite edge.',
  watch: 'It only works close to the surface, about 1 to 2 cm. Adjust the dial with the sensor over the floor and the line until the on-board light switches between them.',
  polarity: 'polarized',
  pins: [
    { name: 'VCC', role: 'power', note: 'Connects to 5V or 3.3V.' },
    { name: 'GND', role: 'ground', note: 'Connects to GND.' },
    { name: 'OUT (D0)', role: 'output', note: 'Goes HIGH or LOW depending on whether it sees a dark or light surface.' },
  ],
  pinOrder: 'varies',
  callouts: [
    { at: 'emitter', text: 'The clear LED sends out infrared light.' },
    { at: 'receiver', text: 'The dark component receives the light that bounces back.' },
    { at: 'dial', text: 'The dial sets the switching point. Turn it until the light changes between the line and the floor.' },
    { at: 'pins', text: 'Pins: read the labels on yours, because the order differs.' },
  ],
};

export const soil: PartGuide = {
  id: 'soil-moisture',
  drawing: 'soil',
  symbol: null,
  symbolNote: 'Sensor modules are drawn as a labelled box in circuit diagrams.',
  what: 'Gives a reading that changes with how wet the soil around it is.',
  spot: 'A flat two-pronged probe on a lead, plus a small board with an amplifier chip that connects to it.',
  watch: 'The bare metal of a resistive probe corrodes quickly if it is left powered in wet soil. Power it only when you take a reading, or use a capacitive probe.',
  polarity: 'polarized',
  pins: [
    { name: 'VCC', role: 'power', note: 'Connects to 3.3V or 5V.' },
    { name: 'GND', role: 'ground', note: 'Connects to GND.' },
    { name: 'AO', role: 'output', note: 'Analog output. Connects to an analog pin for a reading that goes up and down.' },
    { name: 'DO', role: 'output', note: 'Digital output, on some boards. It switches at the dial setting.' },
  ],
  pinOrder: 'varies',
  callouts: [
    { at: 'prongs', text: 'The two prongs go into the soil, up to the line and no further.' },
    { at: 'pins', text: 'Pins: read the labels on yours, because the order differs.' },
  ],
};

export const lcd: PartGuide = {
  id: 'lcd-i2c-16x2',
  drawing: 'lcd',
  symbol: null,
  symbolNote: 'Displays are drawn as a labelled box in circuit diagrams.',
  what: 'A screen that shows 16 characters on each of two lines. The I2C backpack lets it talk over just two wires.',
  spot: 'A blue or green screen with a small board on the back that has a four-pin header and a blue trimmer.',
  watch: 'Blank white boxes or nothing at all usually means the contrast is wrong: turn the blue trimmer on the back. If that does not help, your I2C address may be 0x3F instead of the usual 0x27.',
  polarity: 'polarized',
  pins: [
    { name: 'GND', role: 'ground', note: 'Connects to GND.' },
    { name: 'VCC', role: 'power', note: 'Connects to 5V.' },
    { name: 'SDA', role: 'signal', note: 'The data line. On an Uno it is A4; on an ESP32 DevKit V1 it is GPIO 21.' },
    { name: 'SCL', role: 'signal', note: 'The clock line. On an Uno it is A5; on an ESP32 DevKit V1 it is GPIO 22.' },
  ],
  pinOrder: 'varies',
  callouts: [
    { at: 'display', text: 'The display: two lines of 16 characters each.' },
    { at: 'mount-hole', text: 'Mounting hole: the board can be screwed into a case.' },
  ],
};
