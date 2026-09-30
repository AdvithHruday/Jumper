import type { LibraryProject } from '@/lib/library/types';
import { AVR_BOARD, AVR_BOARDS, BREADBOARD, WIRES, led, ledResistor, item } from './common';

/**
 * Library builds, group 2: sensors and modules. `verified` stays false until
 * built on hardware; see basics.ts.
 */

export const ldrNightLight: LibraryProject = {
  id: 'ldr-night-light',
  name: 'Automatic night light',
  summary: 'An LED that switches on by itself when the room gets dark.',
  difficulty: 2,
  minutes: 30,
  boards: AVR_BOARDS,
  learn: ['Voltage dividers', 'Analog sensors', 'Choosing a threshold'],
  requires: [AVR_BOARD, item('ldr', 'LDR (light sensor)'), item('res-10k', '10 kΩ resistor'), led(1), ledResistor(1), BREADBOARD, WIRES],
  wiring: [
    { board: '5V', part: 'LDR, one leg' },
    { board: 'A0', part: 'LDR other leg and the 10 kΩ resistor, joined' },
    { board: 'GND', part: '10 kΩ resistor, other leg' },
    { board: 'D9', part: 'LED long leg (anode)', via: '220 Ω resistor' },
    { board: 'GND', part: 'LED short leg (cathode)' },
  ],
  steps: [
    'Build the divider: 5V to the LDR, the LDR to a column that also holds the 10 kΩ resistor, and the resistor to GND.',
    'Run a wire from that shared column to A0.',
    'Wire the LED and its resistor to pin 9 and GND.',
    'Upload, open the Serial Monitor at 9600 baud, and cover the sensor to see the numbers drop. Adjust DARK_BELOW to suit your room.',
  ],
  code: {
    file: 'night_light.ino',
    source: `const int LDR_PIN = A0;
const int LED_PIN = 9;
const int DARK_BELOW = 400;   // lower this number = needs to be darker

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int light = analogRead(LDR_PIN);   // 0 (dark) to 1023 (bright) with this wiring
  Serial.println(light);
  digitalWrite(LED_PIN, light < DARK_BELOW ? HIGH : LOW);
  delay(100);
}`,
  },
  errors: [
    { symptom: 'The light is always on, or always off', cause: 'The threshold does not suit your room.', fix: 'Open the Serial Monitor, note the value in light and dark, and set DARK_BELOW between them.' },
    { symptom: 'The reading is stuck at 0 or 1023', cause: 'The 10 kΩ resistor is missing or not joined to the same column as the LDR.', fix: 'Check that A0, one LDR leg and one resistor leg all share a column.' },
    { symptom: 'It works backwards (on in the light)', cause: 'The LDR and the resistor are swapped in the divider.', fix: 'Put the LDR on the 5V side and the resistor on the GND side, or flip the comparison in the sketch.' },
  ],
  verified: false,
};

export const ultrasonicDistance: LibraryProject = {
  id: 'ultrasonic-distance',
  name: 'Distance meter',
  summary: 'Measure how far away an object is with an HC-SR04 and print it.',
  difficulty: 2,
  minutes: 30,
  boards: AVR_BOARDS,
  learn: ['Timing pulses with pulseIn', 'Speed of sound', 'The Serial Monitor'],
  requires: [AVR_BOARD, item('hc-sr04', 'HC-SR04 ultrasonic sensor'), BREADBOARD, WIRES],
  wiring: [
    { board: '5V', part: 'HC-SR04 VCC' },
    { board: 'D9', part: 'HC-SR04 TRIG' },
    { board: 'D10', part: 'HC-SR04 ECHO' },
    { board: 'GND', part: 'HC-SR04 GND' },
  ],
  steps: [
    'Plug the HC-SR04 into the breadboard so its four pins are in four separate columns.',
    'Wire VCC to 5V, GND to GND, TRIG to pin 9 and ECHO to pin 10.',
    'Upload the sketch and open the Serial Monitor at 9600 baud.',
    'Move your hand toward and away from the sensor and watch the distance change.',
  ],
  code: {
    file: 'distance.ino',
    source: `const int TRIG_PIN = 9;
const int ECHO_PIN = 10;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);   // a 10 microsecond pulse starts a measurement
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);   // give up after 30 ms
  if (duration == 0) {
    Serial.println("No echo");
  } else {
    float cm = duration * 0.0343 / 2;   // sound travels there and back
    Serial.print(cm);
    Serial.println(" cm");
  }
  delay(200);
}`,
  },
  errors: [
    { symptom: 'It always prints "No echo"', cause: 'TRIG and ECHO are swapped, or 5V is not connected.', fix: 'TRIG goes to the pin the sketch sets as OUTPUT and ECHO to the INPUT pin; check VCC and GND.' },
    { symptom: 'The numbers jump around', cause: 'A soft, angled or very small surface reflects the pulse poorly.', fix: 'Aim at a flat, hard surface at least 2 cm away, and average several readings.' },
    { symptom: 'It reads far too short', cause: 'Something is directly in front of the sensor, or a wire is in its view.', fix: 'Clear the area and keep the sensor still while testing.' },
  ],
  verified: false,
};

export const servoSweep: LibraryProject = {
  id: 'servo-sweep',
  name: 'Servo sweep',
  summary: 'Sweep an SG90 servo back and forth. The basis for arms and pan-tilt heads.',
  difficulty: 2,
  minutes: 20,
  boards: AVR_BOARDS,
  learn: ['Servo control', 'Using a library', 'Power for motors'],
  requires: [AVR_BOARD, item('servo-sg90', 'SG90 micro servo'), BREADBOARD, WIRES],
  wiring: [
    { board: 'D9', part: 'Servo signal wire (orange or yellow)' },
    { board: '5V', part: 'Servo power wire (red)' },
    { board: 'GND', part: 'Servo ground wire (brown or black)' },
  ],
  steps: [
    'Plug the three servo wires into the breadboard, or use male-to-male jumpers straight from the servo plug.',
    'Signal to pin 9, red to 5V, brown or black to GND.',
    'Upload the sketch. It uses the built-in Servo library, so nothing to install.',
    'The horn should sweep from 10 to 170 degrees and back.',
  ],
  code: {
    file: 'servo_sweep.ino',
    source: `#include <Servo.h>

const int SERVO_PIN = 9;
Servo arm;

void setup() {
  arm.attach(SERVO_PIN);
}

void loop() {
  for (int angle = 10; angle <= 170; angle++) {   // stay off the very ends
    arm.write(angle);
    delay(15);
  }
  for (int angle = 170; angle >= 10; angle--) {
    arm.write(angle);
    delay(15);
  }
}`,
  },
  errors: [
    { symptom: 'The board resets or the servo twitches', cause: 'The servo draws more current than the USB port gives, especially when it strains.', fix: 'Power the servo from a separate 5 V supply and join its GND to the board GND.' },
    { symptom: 'The servo buzzes at the ends of its travel', cause: 'It is being pushed past its mechanical limit.', fix: 'Keep the angle range inside 10 to 170 degrees, as the sketch does.' },
    { symptom: 'Nothing moves', cause: 'The signal wire is on the wrong pin, or the wires are in a different order.', fix: 'Check the signal wire goes to the pin passed to attach().' },
  ],
  warnings: ['With the Servo library running, analogWrite() (PWM) does not work on pins 9 and 10 of an Uno or Nano.'],
  verified: false,
};

export const dht11Monitor: LibraryProject = {
  id: 'dht11-monitor',
  name: 'Temperature and humidity monitor',
  summary: 'Read a DHT11 and print the temperature and humidity every two seconds.',
  difficulty: 2,
  minutes: 30,
  boards: AVR_BOARDS,
  learn: ['Installing a library', 'Reading a digital sensor', 'Handling failed readings'],
  requires: [AVR_BOARD, item('dht11', 'DHT11 module (3 pins)'), BREADBOARD, WIRES],
  wiring: [
    { board: '5V', part: 'DHT11 VCC (+)' },
    { board: 'D2', part: 'DHT11 DATA (S)', implicit: true },
    { board: 'GND', part: 'DHT11 GND (−)' },
  ],
  steps: [
    'In the Arduino IDE open Tools > Manage Libraries, and install "DHT sensor library" by Adafruit (accept its "Adafruit Unified Sensor" dependency).',
    'Connect the module: + to 5V, − to GND, S to pin 2.',
    'Upload the sketch and open the Serial Monitor at 9600 baud.',
  ],
  libraries: ['DHT sensor library (Adafruit)', 'Adafruit Unified Sensor'],
  code: {
    file: 'dht11_monitor.ino',
    source: `#include <DHT.h>

const int DHT_PIN = 2;
DHT dht(DHT_PIN, DHT11);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float humidity = dht.readHumidity();
  float celsius = dht.readTemperature();

  if (isnan(humidity) || isnan(celsius)) {
    Serial.println("Could not read the sensor. Check the wiring.");
  } else {
    Serial.print(celsius);
    Serial.print(" C, ");
    Serial.print(humidity);
    Serial.println(" % humidity");
  }
  delay(2000);   // the DHT11 cannot be read faster than about once a second
}`,
  },
  errors: [
    { symptom: 'Compile error: DHT.h: No such file or directory', cause: 'The library is not installed.', fix: 'Install "DHT sensor library" by Adafruit from the Library Manager, plus Adafruit Unified Sensor.' },
    { symptom: 'It always says it could not read the sensor', cause: 'DATA is on the wrong pin, or the sensor has no power.', fix: 'Check DATA goes to pin 2 and VCC to 5V. A bare 4-pin DHT11 also needs a 10 kΩ resistor from DATA to VCC; the 3-pin module already has one.' },
    { symptom: 'The values change very slowly or look off', cause: 'The DHT11 is slow and only accurate to about 2 °C.', fix: 'Wait a few seconds after a change and treat the reading as approximate.' },
  ],
  verified: false,
};

export const lcdHello: LibraryProject = {
  id: 'lcd-i2c-hello',
  name: 'LCD message board',
  summary: 'Show text on a 16×2 LCD using only four wires (I2C).',
  difficulty: 2,
  minutes: 30,
  boards: AVR_BOARDS,
  learn: ['I2C', 'Installing a library', 'Finding a device address'],
  requires: [AVR_BOARD, item('lcd-i2c-16x2', '16×2 LCD with I2C backpack'), WIRES],
  wiring: [
    { board: 'GND', part: 'LCD backpack GND' },
    { board: '5V', part: 'LCD backpack VCC' },
    { board: 'A4', part: 'LCD backpack SDA', implicit: true },
    { board: 'A5', part: 'LCD backpack SCL', implicit: true },
  ],
  steps: [
    'Install "LiquidCrystal I2C" by Frank de Brabander from the Library Manager.',
    'Wire GND, VCC, SDA to A4 and SCL to A5.',
    'Upload the sketch. If the screen stays blank, turn the small blue contrast screw on the backpack.',
  ],
  libraries: ['LiquidCrystal I2C (Frank de Brabander)'],
  code: {
    file: 'lcd_hello.ino',
    source: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);   // some backpacks use 0x3F instead

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello, Ohmwise!");
  lcd.setCursor(0, 1);
  lcd.print("It works :)");
}

void loop() {
}`,
  },
  errors: [
    { symptom: 'The backlight is on but the screen is blank', cause: 'The contrast is set too low.', fix: 'Turn the small blue potentiometer on the back of the backpack with a screwdriver.' },
    { symptom: 'Nothing shows and the backlight may be off', cause: 'The I2C address is not 0x27; many backpacks use 0x3F.', fix: 'Change the address in the sketch to 0x3F, or run an I2C scanner sketch to find it.' },
    { symptom: 'Compile error: LiquidCrystal_I2C.h not found', cause: 'The library is not installed.', fix: 'Install "LiquidCrystal I2C" from the Library Manager.' },
  ],
  warnings: ['SDA and SCL are on A4 and A5 for the Uno and Nano. On an ESP32 they are GPIO21 and GPIO22.'],
  verified: false,
};

export const pirAlarm: LibraryProject = {
  id: 'pir-alarm',
  name: 'Motion alarm',
  summary: 'A PIR sensor sets off a buzzer when it senses movement.',
  difficulty: 2,
  minutes: 30,
  boards: AVR_BOARDS,
  learn: ['Digital sensors', 'Sensor warm-up time', 'Combining input and output'],
  requires: [AVR_BOARD, item('pir-hc-sr501', 'HC-SR501 PIR motion sensor'), item('buzzer-active', 'Active buzzer'), BREADBOARD, WIRES],
  wiring: [
    { board: '5V', part: 'PIR VCC' },
    { board: 'D2', part: 'PIR OUT' },
    { board: 'GND', part: 'PIR GND' },
    { board: 'D8', part: 'Buzzer positive (+) leg' },
    { board: 'GND', part: 'Buzzer negative leg' },
  ],
  steps: [
    'Connect the PIR: VCC to 5V, GND to GND, OUT to pin 2.',
    'Wire the buzzer + to pin 8 and the other leg to GND.',
    'Upload, then keep still for about a minute while the sensor warms up.',
    'Wave a hand in front of it: the buzzer sounds while it senses motion.',
  ],
  code: {
    file: 'motion_alarm.ino',
    source: `const int PIR_PIN = 2;
const int BUZZER_PIN = 8;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  bool motion = digitalRead(PIR_PIN) == HIGH;
  digitalWrite(BUZZER_PIN, motion ? HIGH : LOW);
  delay(50);
}`,
  },
  errors: [
    { symptom: 'It triggers constantly for the first minute', cause: 'The HC-SR501 needs 30 to 60 seconds to settle after power-up.', fix: 'Stay out of its view and wait; ignore triggers during warm-up.' },
    { symptom: 'It never triggers', cause: 'The sensitivity dial is turned right down, or OUT is on the wrong pin.', fix: 'Turn the sensitivity screw up a little and check OUT goes to pin 2.' },
    { symptom: 'The buzzer stays on for several seconds after motion stops', cause: 'The sensor holds its output HIGH for a set time, by design.', fix: 'Turn the time-delay dial down for a shorter hold.' },
  ],
  verified: false,
};

export const soilMoisture: LibraryProject = {
  id: 'soil-moisture',
  name: 'Soil moisture reader',
  summary: 'Read how wet the soil is and say when a plant needs water.',
  difficulty: 2,
  minutes: 25,
  boards: AVR_BOARDS,
  learn: ['Analog sensors', 'Calibrating a sensor', 'Turning readings into decisions'],
  requires: [AVR_BOARD, item('soil-moisture', 'Soil moisture sensor module'), WIRES],
  wiring: [
    { board: '5V', part: 'Sensor VCC' },
    { board: 'GND', part: 'Sensor GND' },
    { board: 'A0', part: 'Sensor analog output (AO)' },
  ],
  steps: [
    'Wire VCC to 5V, GND to GND and AO to A0.',
    'Upload the sketch and open the Serial Monitor at 9600 baud.',
    'Note the reading with the probe in dry air and again in a glass of water; these are your dry and wet numbers.',
    'Edit DRY_ABOVE in the sketch so it sits between them.',
  ],
  code: {
    file: 'soil_moisture.ino',
    source: `const int SENSOR_PIN = A0;
const int DRY_ABOVE = 600;   // calibrate: readings are HIGH when dry on most modules

void setup() {
  Serial.begin(9600);
}

void loop() {
  int reading = analogRead(SENSOR_PIN);
  Serial.print(reading);
  Serial.println(reading > DRY_ABOVE ? "  dry: water me" : "  moist");
  delay(1000);
}`,
  },
  errors: [
    { symptom: 'The readings are backwards (high when wet)', cause: 'Some modules read the other way round.', fix: 'Flip the comparison and the labels, after checking with the dry and wet test.' },
    { symptom: 'The probe corrodes within weeks', cause: 'Cheap resistive probes corrode when powered all the time.', fix: 'Power the sensor only while reading, or use a capacitive soil sensor.' },
    { symptom: 'The number jumps around', cause: 'Loose contact between the probe and the soil.', fix: 'Push the probe in firmly and average several readings.' },
  ],
  verified: false,
};

export const SENSOR_PROJECTS: LibraryProject[] = [
  ldrNightLight,
  ultrasonicDistance,
  servoSweep,
  dht11Monitor,
  lcdHello,
  pirAlarm,
  soilMoisture,
];
