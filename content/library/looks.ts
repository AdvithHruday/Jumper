/**
 * What each part looks like on a desk, written for the vision model that reads
 * a student's photo. Short and physical: colour, shape, distinguishing marks.
 * A test checks every library item has one, so a new part cannot ship without
 * telling the scanner how to recognise it.
 */
export const LOOKS: Record<string, string> = {
  uno: 'Blue or teal board about 7 cm wide with a large silver USB-B socket at one end, a black DC barrel jack, a long black microcontroller chip and two rows of black female headers.',
  nano: 'Very small board (about 4.5 x 1.8 cm) with a mini or micro USB socket, pin headers along both long edges and a small square chip; sits well on a breadboard.',
  'esp32-devkit-v1': 'Black or dark board with a metal-shielded module carrying a printed antenna, a micro-USB socket and two small buttons marked BOOT and EN, pins along both long edges.',

  breadboard: 'White plastic board covered in a grid of small holes with red and blue lines along the edges.',
  'jumper-wires': 'A bundle of thin coloured wires with small metal pins or sockets on the ends.',
  'res-220': 'Tiny beige or blue cylinder with two wire legs and colour bands: red, red, brown, then gold.',
  'res-330': 'Tiny cylinder with two wire legs and colour bands: orange, orange, brown, then gold.',
  'res-470': 'Tiny cylinder with two wire legs and colour bands: yellow, violet, brown, then gold.',
  'res-1k': 'Tiny cylinder with two wire legs and colour bands: brown, black, red, then gold.',
  'res-10k': 'Tiny cylinder with two wire legs and colour bands: brown, black, orange, then gold.',

  'led-5mm': 'Small clear or coloured plastic dome about 5 mm wide with two metal legs, one longer than the other.',
  'led-rgb-cc': 'Clear plastic dome about 5 mm wide with FOUR legs, one clearly longer than the rest.',
  'buzzer-active': 'Black plastic cylinder about 12 mm wide with a small hole on top, a + mark and two legs; the underside is sealed.',

  'push-button': 'Small square black plastic button about 6 mm with four metal legs, one at each corner.',
  'potentiometer-10k': 'Blue or white rotary component with three legs in a row and a knob or a screw slot on top.',
  ldr: 'Small flat disc about 5 mm wide with a wavy zig-zag pattern on its face and two long legs.',

  'hc-sr04': 'Blue circuit board with two large silver cylinders on the front that look like eyes, and four pins along the bottom.',
  dht11: 'Small blue or white plastic block with a grid of slits on the front, on a tiny board with three pins (or four pins as a bare sensor).',
  'pir-hc-sr501': 'White plastic dome (lens) on top of a small green board, with two orange adjustment dials on the back and three pins.',
  'ir-line-sensor': 'Small board with a clear LED and a dark LED side by side facing the same way, a blue adjustment dial and three pins.',
  'soil-moisture': 'Long thin fork-shaped board (two prongs) that goes into soil, usually with a small separate control board and a 3-wire cable.',

  'servo-sg90': 'Small blue plastic box about 2.3 cm wide with a white plastic horn on top and a three-wire cable (brown, red, orange) ending in a plug.',
  l298n: 'Red board with a large black heatsink, blue screw terminals and a row of pins, about 5 cm square.',
  'dc-motor-gear': 'Yellow plastic gearbox with a small motor attached, two wires and a shaft that takes a wheel.',
  'robot-chassis': 'Flat acrylic or metal plate with mounting holes for motors and wheels.',

  'lcd-i2c-16x2': 'Green or blue rectangular display about 8 cm wide showing two rows of 16 character cells, with a small extra board with four pins soldered to the back.',

  'battery-pack': 'Black plastic holder for four AA batteries with a red and a black wire, or a switch on the side.',
};
