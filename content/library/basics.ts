import type { LibraryProject } from '@/lib/library/types';
import { blink } from '@/content/sketches';
import { AVR_BOARD, AVR_BOARDS, BREADBOARD, WIRES, led, ledResistor, item } from './common';

/**
 * Library builds, group 1: LEDs, buttons, sound.
 *
 * Every entry is `verified: false` until someone builds it on real hardware
 * and it works. Wiring and code are checked against each other and against the
 * board pin data by `library.test.ts`, which catches a wrong pin number but
 * not a wrong part, so the flag stays false until a human has tried it.
 */

export const ledBlink: LibraryProject = {
  id: 'led-blink',
  name: 'Blink an LED',
  summary: 'The first circuit: one LED on pin 9 that blinks once a second.',
  difficulty: 1,
  minutes: 20,
  boards: AVR_BOARDS,
  learn: ['Breadboard basics', 'LED direction', 'Why an LED needs a resistor'],
  requires: [AVR_BOARD, led(1), ledResistor(1), BREADBOARD, WIRES],
  wiring: [
    { board: 'D9', part: 'LED long leg (anode)', via: '220 Ω resistor' },
    { board: 'GND', part: 'LED short leg (cathode)' },
  ],
  steps: [
    'Push the LED into the breadboard with its two legs in different columns. The longer leg is the anode (+).',
    'Put the resistor between the LED long leg and a jumper wire going to pin 9.',
    'Run a second jumper wire from the LED short leg to GND.',
    'Upload the sketch. The LED should blink once a second.',
  ],
  code: { file: 'blink.ino', source: blink },
  errors: [
    { symptom: 'The LED never lights', cause: 'It is in backwards.', fix: 'Turn it round: long leg toward pin 9 (through the resistor), short leg toward GND.' },
    { symptom: 'The LED never lights', cause: 'The resistor and LED are not in the same column, so the circuit is not complete.', fix: 'Check that the resistor leg and the LED leg share a column of five holes.' },
    { symptom: 'The LED never lights', cause: 'The pin in the sketch is not the pin you wired.', fix: 'Make LED_PIN in the sketch match the pin the jumper wire goes to.' },
    { symptom: 'The upload fails', cause: 'Board, port or cable problem, not your wiring.', fix: 'Use the Upload Doctor with the error text.' },
  ],
  guidedId: 'first-light',
  verified: false,
};

export const buttonLed: LibraryProject = {
  id: 'button-led',
  name: 'Button controls an LED',
  summary: 'Hold a push button and an LED lights. Teaches inputs and pull-up resistors.',
  difficulty: 1,
  minutes: 25,
  boards: AVR_BOARDS,
  learn: ['Digital inputs', 'INPUT_PULLUP', 'Reading a button'],
  requires: [AVR_BOARD, item('push-button', 'Push button'), led(1), ledResistor(1), BREADBOARD, WIRES],
  wiring: [
    { board: 'D2', part: 'Push button, one leg' },
    { board: 'GND', part: 'Push button, the opposite leg' },
    { board: 'D9', part: 'LED long leg (anode)', via: '220 Ω resistor' },
    { board: 'GND', part: 'LED short leg (cathode)' },
  ],
  steps: [
    'Place the button across the centre gap of the breadboard so its two sides are not already connected.',
    'Wire one button leg to pin 2 and the diagonal leg to GND.',
    'Build the LED circuit on pin 9 exactly as in Blink an LED.',
    'Upload and press the button: the LED lights only while it is held.',
  ],
  code: {
    file: 'button_led.ino',
    source: `const int BUTTON_PIN = 2;
const int LED_PIN = 9;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // pin reads HIGH until the button pulls it to GND
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  bool pressed = digitalRead(BUTTON_PIN) == LOW;  // LOW means pressed
  digitalWrite(LED_PIN, pressed ? HIGH : LOW);
}`,
  },
  errors: [
    { symptom: 'The LED is on when the button is NOT pressed', cause: 'INPUT_PULLUP inverts the reading: the pin is LOW when pressed.', fix: 'Test for LOW as the sketch does, not HIGH.' },
    { symptom: 'The button does nothing', cause: 'Two of its legs are always joined inside, and you used that pair.', fix: 'Rotate the button a quarter turn so the wires use diagonal legs.' },
    { symptom: 'The LED flickers or the reading jumps', cause: 'A loose wire or a missing pull-up leaves the pin floating.', fix: 'Keep pinMode(BUTTON_PIN, INPUT_PULLUP) and check the GND connection.' },
  ],
  verified: false,
};

export const rgbLed: LibraryProject = {
  id: 'rgb-led',
  name: 'RGB colour mixer',
  summary: 'Fade through colours with one RGB LED and three PWM pins.',
  difficulty: 2,
  minutes: 30,
  boards: AVR_BOARDS,
  learn: ['PWM with analogWrite', 'Mixing light', 'Common-cathode LEDs'],
  requires: [
    AVR_BOARD,
    item('led-rgb-cc', 'RGB LED (common cathode)'),
    ledResistor(3),
    BREADBOARD,
    WIRES,
  ],
  wiring: [
    { board: 'D9', part: 'RGB LED red leg', via: '220 Ω resistor' },
    { board: 'D10', part: 'RGB LED green leg', via: '220 Ω resistor' },
    { board: 'D11', part: 'RGB LED blue leg', via: '220 Ω resistor' },
    { board: 'GND', part: 'RGB LED longest leg (common cathode)' },
  ],
  steps: [
    'Hold the RGB LED with its flat side left: the legs read red, common (longest), green, blue.',
    'Give each of the red, green and blue legs its own resistor, then a wire to pins 9, 10 and 11.',
    'Connect the longest leg to GND.',
    'Upload the sketch and watch the colours cycle.',
  ],
  code: {
    file: 'rgb_mixer.ino',
    source: `const int RED_PIN = 9;
const int GREEN_PIN = 10;
const int BLUE_PIN = 11;

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
}

void setColor(int r, int g, int b) {
  analogWrite(RED_PIN, r);
  analogWrite(GREEN_PIN, g);
  analogWrite(BLUE_PIN, b);
}

void loop() {
  setColor(255, 0, 0);    // red
  delay(700);
  setColor(0, 255, 0);    // green
  delay(700);
  setColor(0, 0, 255);    // blue
  delay(700);
  setColor(255, 120, 0);  // orange
  delay(700);
}`,
  },
  errors: [
    { symptom: 'The colours are wrong (red shows as green, say)', cause: 'The legs are in a different order than you assumed.', fix: 'Check which leg is longest, then test each leg alone by changing one value at a time.' },
    { symptom: 'Only one colour ever lights', cause: 'One of the other two legs has no resistor or no wire.', fix: 'Check each leg has its own resistor and its own pin wire.' },
    { symptom: 'The colours are inverted (0 is bright)', cause: 'You have a common-anode RGB LED.', fix: 'Connect the common leg to 5V instead of GND and use 255 minus each value.' },
  ],
  verified: false,
};

export const potDimmer: LibraryProject = {
  id: 'pot-dimmer',
  name: 'Dim an LED with a knob',
  summary: 'Turn a potentiometer to change the brightness of an LED.',
  difficulty: 1,
  minutes: 25,
  boards: AVR_BOARDS,
  learn: ['Analog input', 'analogRead and analogWrite', 'Voltage dividers'],
  requires: [AVR_BOARD, item('potentiometer-10k', '10 kΩ potentiometer'), led(1), ledResistor(1), BREADBOARD, WIRES],
  wiring: [
    { board: '5V', part: 'Potentiometer outer leg' },
    { board: 'GND', part: 'Potentiometer other outer leg' },
    { board: 'A0', part: 'Potentiometer middle leg (wiper)' },
    { board: 'D9', part: 'LED long leg (anode)', via: '220 Ω resistor' },
    { board: 'GND', part: 'LED short leg (cathode)' },
  ],
  steps: [
    'Push the potentiometer into the breadboard with its three legs in three different columns.',
    'Connect the outer legs to 5V and GND, and the middle leg to A0.',
    'Wire the LED and resistor on pin 9 as in Blink an LED.',
    'Upload and turn the knob: the LED should smoothly brighten and dim.',
  ],
  code: {
    file: 'pot_dimmer.ino',
    source: `const int POT_PIN = A0;
const int LED_PIN = 9;   // must be a PWM pin: 3, 5, 6, 9, 10 or 11

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int reading = analogRead(POT_PIN);   // 0 to 1023
  int brightness = reading / 4;        // 0 to 255
  analogWrite(LED_PIN, brightness);
}`,
  },
  errors: [
    { symptom: 'Turning the knob does nothing', cause: 'The wiper (middle leg) is not on A0.', fix: 'Move the middle leg to A0 and keep the outer legs on 5V and GND.' },
    { symptom: 'The brightness goes the wrong way', cause: 'The outer legs are swapped.', fix: 'Swap the 5V and GND wires on the outer legs.' },
    { symptom: 'The LED only switches fully on or fully off', cause: 'The LED is on a pin without PWM.', fix: 'Use pin 3, 5, 6, 9, 10 or 11. Check my code will flag this.' },
  ],
  verified: false,
};

export const buzzerBeep: LibraryProject = {
  id: 'buzzer-beep',
  name: 'Beeping buzzer',
  summary: 'Make an active buzzer beep in a pattern. A first step toward alarms.',
  difficulty: 1,
  minutes: 15,
  boards: AVR_BOARDS,
  learn: ['Digital outputs', 'Timing with delay()', 'Active vs passive buzzers'],
  requires: [AVR_BOARD, item('buzzer-active', 'Active buzzer'), BREADBOARD, WIRES],
  wiring: [
    { board: 'D8', part: 'Buzzer positive (+) leg' },
    { board: 'GND', part: 'Buzzer negative leg' },
  ],
  steps: [
    'Find the + mark on the buzzer, or note that the longer leg is positive.',
    'Wire the + leg to pin 8 and the other leg to GND.',
    'Upload the sketch: three short beeps, then a pause.',
  ],
  code: {
    file: 'buzzer_beep.ino',
    source: `const int BUZZER_PIN = 8;

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(150);
    digitalWrite(BUZZER_PIN, LOW);
    delay(150);
  }
  delay(1500);
}`,
  },
  errors: [
    { symptom: 'No sound at all', cause: 'The buzzer is in backwards, or the wire is on the wrong pin.', fix: 'Swap the legs and check the wire goes to the pin in the sketch.' },
    { symptom: 'Only a click, no tone', cause: 'You have a passive buzzer, which needs a tone rather than plain on/off.', fix: 'Use tone(BUZZER_PIN, 1000) and noTone(BUZZER_PIN) instead of digitalWrite.' },
    { symptom: 'It is very quiet', cause: 'Some buzzers are quiet on a breadboard.', fix: 'Press it against the board or a desk, and check it is a 5 V buzzer.' },
  ],
  verified: false,
};

export const trafficLight: LibraryProject = {
  id: 'traffic-light',
  name: 'Traffic light',
  summary: 'Three LEDs cycle red, green and yellow like a real signal.',
  difficulty: 1,
  minutes: 30,
  boards: AVR_BOARDS,
  learn: ['Several outputs at once', 'Sequencing', 'Writing tidy helper functions'],
  requires: [AVR_BOARD, led(3), ledResistor(3), BREADBOARD, WIRES],
  wiring: [
    { board: 'D8', part: 'Red LED long leg (anode)', via: '220 Ω resistor' },
    { board: 'D9', part: 'Yellow LED long leg (anode)', via: '220 Ω resistor' },
    { board: 'D10', part: 'Green LED long leg (anode)', via: '220 Ω resistor' },
    { board: 'GND', part: 'All three LED short legs (cathodes)' },
  ],
  steps: [
    'Place three LEDs in a row, each in its own columns, long legs on the same side.',
    'Give each LED its own resistor and its own wire to pin 8, 9 or 10.',
    'Join the three short legs to the GND rail and run one wire from the rail to GND.',
    'Upload and watch the sequence: green, yellow, red, repeat.',
  ],
  code: {
    file: 'traffic_light.ino',
    source: `const int RED_PIN = 8;
const int YELLOW_PIN = 9;
const int GREEN_PIN = 10;

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
}

void show(bool red, bool yellow, bool green) {
  digitalWrite(RED_PIN, red);
  digitalWrite(YELLOW_PIN, yellow);
  digitalWrite(GREEN_PIN, green);
}

void loop() {
  show(false, false, true);   // green: go
  delay(4000);
  show(false, true, false);   // yellow: get ready
  delay(1500);
  show(true, false, false);   // red: stop
  delay(4000);
}`,
  },
  errors: [
    { symptom: 'One LED never lights', cause: 'It is in backwards or its resistor is not in the same column.', fix: 'Turn it round and check the resistor shares a column with one of its legs.' },
    { symptom: 'The colours light in the wrong order', cause: 'The wires are on different pins than the sketch names.', fix: 'Match RED_PIN, YELLOW_PIN and GREEN_PIN to the pins you wired.' },
    { symptom: 'All three glow dimly', cause: 'The GND rail is not connected to the board GND.', fix: 'Add the wire from the rail to a GND pin.' },
  ],
  verified: false,
};

export const BASIC_PROJECTS: LibraryProject[] = [
  ledBlink,
  buttonLed,
  buzzerBeep,
  potDimmer,
  trafficLight,
  rgbLed,
];
