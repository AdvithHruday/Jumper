import type { PartGuide } from '@/lib/parts/types';

/**
 * Boards, the breadboard, jumper wires and resistors. Where a guided-project
 * part record already describes a part (`guidedPartId`), its wording is reused,
 * so the Parts page and the guided steps never say different things.
 *
 * Board pin facts (PWM, analog, input-only, reserved) are not repeated here:
 * the page reads them from content/boards, the same data the pin checker uses.
 */

export const uno: PartGuide = {
  id: 'uno',
  drawing: 'uno',
  symbol: null,
  symbolNote: 'A board has no schematic symbol of its own: circuits show its pins as labelled connections.',
  guidedPartId: 'arduino-uno',
  polarity: 'none',
  pins: [],
  pinOrder: 'none',
  callouts: [
    { at: 'usb', text: 'USB socket: plugs into your computer, for power and for uploading.' },
    { at: 'chip', text: 'The main chip (ATmega328P): it runs your sketch.' },
    { at: 'digital-pins', text: 'Digital pins 0 to 13, along the top edge.' },
    { at: 'power-pins', text: 'Power pins: 5V, 3.3V and GND.' },
    { at: 'analog-pins', text: 'Analog pins A0 to A5, along the bottom edge.' },
  ],
};

export const nano: PartGuide = {
  id: 'nano',
  drawing: 'nano',
  symbol: null,
  symbolNote: 'A board has no schematic symbol of its own: circuits show its pins as labelled connections.',
  what: 'A small Arduino board that plugs straight into a breadboard.',
  spot: 'About 4.5 by 1.8 cm, with a mini or micro USB socket and a row of pins along each long edge.',
  watch: 'Clone Nanos usually need the "ATmega328P (Old Bootloader)" processor setting and a CH340 driver to upload.',
  polarity: 'none',
  pins: [],
  pinOrder: 'none',
  callouts: [
    { at: 'usb', text: 'USB socket, for power and for uploading.' },
    { at: 'chip', text: 'The main chip, which runs your sketch.' },
    { at: 'pins', text: 'Pins along both long edges. It has A0 to A7; A6 and A7 are analog inputs only.' },
  ],
};

export const esp32: PartGuide = {
  id: 'esp32-devkit-v1',
  drawing: 'esp32',
  symbol: null,
  symbolNote: 'A board has no schematic symbol of its own: circuits show its pins as labelled connections.',
  what: 'A board with a fast processor and built-in WiFi and Bluetooth.',
  spot: 'A black board with a metal-shielded module and a printed antenna at one end, a micro-USB socket, and two small buttons marked BOOT and EN.',
  watch: 'Its pins work at 3.3 V, not 5 V, and several pins have restrictions. See the pin facts below.',
  polarity: 'none',
  pins: [],
  pinOrder: 'none',
  callouts: [
    { at: 'module', text: 'The shielded module holds the processor, WiFi and flash memory.' },
    { at: 'antenna', text: 'Printed antenna: keep metal and your hand away from it for a good WiFi signal.' },
    { at: 'boot-button', text: 'BOOT: hold it while uploading if the upload will not start.' },
    { at: 'en-button', text: 'EN: resets the board.' },
    { at: 'usb', text: 'Micro-USB socket, for power and for uploading.' },
  ],
};

export const breadboard: PartGuide = {
  id: 'breadboard',
  drawing: 'breadboard',
  symbol: null,
  symbolNote: 'A breadboard is a construction tool, so it does not appear in circuit diagrams.',
  guidedPartId: 'breadboard',
  polarity: 'none',
  pins: [],
  pinOrder: 'none',
  callouts: [
    { at: 'rail', text: 'Power rails: the long red (+) and blue (−) lines are connected along their whole length.' },
    { at: 'column', text: 'Each short column of five holes is connected. Put two legs in one column and they are joined.' },
    { at: 'centre-channel', text: 'The centre channel keeps the two halves apart, so a chip or button can sit across it.' },
  ],
};

export const jumperWires: PartGuide = {
  id: 'jumper-wires',
  drawing: 'jumper-wires',
  symbol: null,
  symbolNote: 'A wire is drawn as a plain line in a circuit diagram.',
  guidedPartId: 'jumper-wires',
  polarity: 'none',
  pins: [],
  pinOrder: 'none',
  callouts: [
    { at: 'wire', text: 'Flexible wire in any colour. Use red for power and black for ground, and other colours for signals.' },
    { at: 'pin-end', text: 'Metal pin: it pushes into a breadboard hole or a header socket.' },
  ],
};

/** The five resistors differ only in their colour bands and what they are used for. */
function resistor(id: string, bands: string[], value: string, uses: string): PartGuide {
  return {
    id,
    drawing: 'resistor',
    bands,
    symbol: 'resistor',
    ...(id === 'res-220'
      ? { guidedPartId: 'res-220' }
      : {
          what: 'Limits how much current flows through part of a circuit.',
          spot: `A small cylinder with coloured bands. ${value} is ${bands.slice(0, 3).join(', ')}, then gold. ${uses}`,
          watch: 'It works either way round. Read the bands with the gold band on the right.',
        }),
    polarity: 'either',
    pins: [
      { name: 'Leg 1', role: 'passive' },
      { name: 'Leg 2', role: 'passive', note: 'Either leg can go either way round.' },
    ],
    pinOrder: 'none',
    callouts: [
      { at: 'first-band', text: 'First band: the first digit of the value.' },
      { at: 'last-band', text: 'Gold band: the tolerance (±5%). It goes on the right when you read the bands.' },
      { at: 'lead', text: 'Leg: a bare wire that goes into the breadboard.' },
    ],
  };
}

export const res220 = resistor('res-220', ['red', 'red', 'brown', 'gold'], '220 Ω', '');
export const res330 = resistor('res-330', ['orange', 'orange', 'brown', 'gold'], '330 Ω', 'A bit dimmer than 220 Ω for an LED, and still safe.');
export const res470 = resistor('res-470', ['yellow', 'violet', 'brown', 'gold'], '470 Ω', 'A safe choice for an LED at 5 V.');
export const res1k = resistor('res-1k', ['brown', 'black', 'red', 'gold'], '1 kΩ', 'Makes an LED dim but safe; also used to limit current into a pin.');
export const res10k = resistor('res-10k', ['brown', 'black', 'orange', 'gold'], '10 kΩ', 'Used in voltage dividers, for example with an LDR.');
