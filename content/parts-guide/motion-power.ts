import type { PartGuide } from '@/lib/parts/types';

/** Motors, the motor driver, the chassis and the battery pack. */

export const servo: PartGuide = {
  id: 'servo-sg90',
  drawing: 'servo',
  symbol: 'motor',
  what: 'A small motor that turns to an angle you choose, usually between 0 and 180 degrees, and holds it.',
  spot: 'A blue or black plastic block about 2.3 cm wide with a white plastic arm (the horn) on top and a three-wire cable.',
  watch: 'A moving servo can pull more current than a USB port gives, which makes the board reset. Power bigger loads from a separate 5 V supply and join the grounds.',
  polarity: 'polarized',
  pins: [
    { name: 'Ground', role: 'ground', note: 'The brown or black wire.' },
    { name: 'Power', role: 'power', note: 'The red wire. Connects to 5V.' },
    { name: 'Signal', role: 'control', note: 'The orange or yellow wire. Connects to a digital pin.' },
  ],
  pinOrder: 'standard',
  callouts: [
    { at: 'horn', text: 'The horn: the arm that turns. Attach the arms and wheels here.' },
    { at: 'body', text: 'The body holds the motor, gears and control circuit.' },
    { at: 'cable', text: 'Cable: brown (ground), red (power), orange (signal). The colours are the same across nearly all servos.' },
  ],
};

export const l298n: PartGuide = {
  id: 'l298n',
  drawing: 'l298n',
  symbol: null,
  symbolNote: 'Driver boards are drawn as a labelled box in circuit diagrams.',
  what: 'Lets your board control the direction and speed of up to two DC motors, which need more current than a board pin can supply.',
  spot: 'A red board with a big black heat sink on top, screw terminals on three sides and a row of pins along one edge.',
  watch: 'Join the ground of the battery, the driver and your board. Without a shared ground, nothing works. The chip also drops about 2 V, so the motors get less than the battery gives.',
  polarity: 'polarized',
  pins: [
    { name: '12V (motor power)', role: 'power', note: 'The battery for the motors connects here.' },
    { name: 'GND', role: 'ground', note: 'Connects to battery ground, and to your board’s GND.' },
    { name: '5V', role: 'power', note: 'Gives 5 V out when the jumper is on and the supply is over 7 V. It is not for the motors.' },
    { name: 'IN1 to IN4', role: 'input', note: 'Direction: two pins for each motor.' },
    { name: 'ENA, ENB', role: 'input', note: 'Speed for each motor. Connect to PWM pins, or leave the jumper on for full speed.' },
    { name: 'OUT1 to OUT4', role: 'output', note: 'The screw terminals for the two motors.' },
  ],
  pinOrder: 'varies',
  callouts: [
    { at: 'heatsink', text: 'The heat sink covers the L298N chip. It gets hot in use: this is normal.' },
    { at: 'motor-a', text: 'Motor A terminals (OUT1 and OUT2).' },
    { at: 'motor-b', text: 'Motor B terminals (OUT3 and OUT4).' },
    { at: 'power-terminal', text: 'Power terminal: 12V (battery), GND and 5V.' },
  ],
};

export const dcMotor: PartGuide = {
  id: 'dc-motor-gear',
  drawing: 'dc-motor',
  symbol: 'motor',
  what: 'A motor with a built-in gearbox: slower than a bare motor, but strong enough to turn a wheel.',
  spot: 'A yellow plastic gearbox with a small silver motor on the side, two wires, and a shaft that sticks out of both sides.',
  watch: 'Never connect it straight to a board pin: it draws far more current than a pin can give. Use a motor driver.',
  polarity: 'either',
  pins: [
    { name: 'Wire 1', role: 'power', note: 'Swapping the two wires reverses the direction.' },
    { name: 'Wire 2', role: 'power' },
  ],
  pinOrder: 'none',
  callouts: [
    { at: 'gearbox', text: 'The gearbox: lowers the speed and raises the turning force.' },
    { at: 'motor', text: 'The motor itself.' },
    { at: 'wires', text: 'Two wires. Either way round works, and swapping them turns the motor the other way.' },
  ],
};

export const chassis: PartGuide = {
  id: 'robot-chassis',
  drawing: 'chassis',
  symbol: null,
  symbolNote: 'A chassis is a structure, so it does not appear in circuit diagrams.',
  what: 'The body of a small robot car: a plate with mounts for two motors, wheels and a caster.',
  spot: 'Usually a clear or coloured acrylic plate with rows of holes, two geared motors, two wheels, and a ball caster at the front.',
  watch: 'Peel the protective paper from the plate before you assemble. It comes with the fixings in a small bag.',
  polarity: 'none',
  pins: [],
  pinOrder: 'none',
  callouts: [
    { at: 'plate', text: 'The base plate, where the board, driver and battery go.' },
    { at: 'motor-mount', text: 'A motor mount: the geared motor bolts on here.' },
    { at: 'holes', text: 'Holes for mounting your parts with screws or cable ties.' },
  ],
};

export const batteryPack: PartGuide = {
  id: 'battery-pack',
  drawing: 'battery-pack',
  symbol: 'battery',
  what: 'A holder that joins four AA batteries in a row, giving about 6 V (4.8 V with rechargeable ones).',
  spot: 'A black plastic box with room for four AA cells, a red wire and a black wire, and sometimes an on/off switch.',
  watch: 'Check that each battery faces the direction shown in the holder. Never short the red and black wires together.',
  polarity: 'polarized',
  pins: [
    { name: 'Red wire', role: 'power', note: 'The positive (+) side.' },
    { name: 'Black wire', role: 'ground', note: 'The negative (−) side. Connects to GND.' },
  ],
  pinOrder: 'none',
  callouts: [
    { at: 'holder', text: 'The holder for four AA batteries.' },
    { at: 'red-wire', text: 'Red wire: positive (+).' },
    { at: 'black-wire', text: 'Black wire: negative (−), which is ground.' },
  ],
};
