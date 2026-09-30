import type { LibraryProject } from '@/lib/library/types';
import { AVR_BOARD, AVR_BOARDS, WIRES, BREADBOARD, led, ledResistor, item } from './common';

/**
 * Library builds, group 3: bigger builds (a robot, an ESP32 WiFi project).
 * `verified` stays false until built on hardware; see basics.ts.
 */

export const lineFollower: LibraryProject = {
  id: 'line-follower',
  name: 'Line-following robot',
  summary: 'A two-wheel robot that follows a black line using two IR sensors.',
  difficulty: 3,
  minutes: 120,
  boards: AVR_BOARDS,
  learn: ['Driving motors with an H-bridge', 'PWM speed control', 'Sensor-based steering', 'Powering motors separately'],
  requires: [
    AVR_BOARD,
    item('l298n', 'L298N motor driver module'),
    item('dc-motor-gear', 'Geared DC motor (TT) with wheel', 2),
    item('robot-chassis', 'Two-wheel robot chassis'),
    item('ir-line-sensor', 'IR line sensor module', 2),
    item('battery-pack', 'Battery pack (4×AA holder) for the motors'),
    WIRES,
  ],
  wiring: [
    { board: 'D5', part: 'L298N ENA (left motor speed)' },
    { board: 'D7', part: 'L298N IN1' },
    { board: 'D8', part: 'L298N IN2' },
    { board: 'D6', part: 'L298N ENB (right motor speed)' },
    { board: 'D9', part: 'L298N IN3' },
    { board: 'D10', part: 'L298N IN4' },
    { board: 'D2', part: 'Left IR sensor OUT' },
    { board: 'D3', part: 'Right IR sensor OUT' },
    { board: '5V', part: 'Both IR sensors VCC' },
    { board: 'GND', part: 'Both IR sensors GND, and the L298N GND (join it to the battery pack negative too)' },
  ],
  steps: [
    'Mount the motors, wheels, caster and sensors on the chassis. Point the two IR sensors down, one on each side of where the line will be, a few millimetres above the floor.',
    'Remove the ENA and ENB jumpers on the L298N so the Arduino can control speed. Connect the left motor to OUT1 and OUT2 and the right motor to OUT3 and OUT4.',
    'Connect the battery pack to the L298N power terminal (positive to 12V, negative to GND) and join the L298N GND to the Arduino GND. Power the Arduino from USB or a separate power bank, not from the motor batteries.',
    'Upload the sketch with the wheels lifted off the floor and check both wheels turn forward. Swap a motor\'s two wires if one spins backward.',
    'Set the robot on a black line on a light floor. Turn the small dial on each sensor until its LED just switches on over the black line.',
  ],
  code: {
    file: 'line_follower.ino',
    source: `// Left motor (channel A) and right motor (channel B) on the L298N.
const int ENA = 5;     // must be a PWM pin
const int IN1 = 7;
const int IN2 = 8;
const int ENB = 6;     // must be a PWM pin
const int IN3 = 9;
const int IN4 = 10;

const int LEFT_SENSOR = 2;
const int RIGHT_SENSOR = 3;

const int SPEED = 150;      // 0 to 255; lower if the robot overshoots corners
const int SEES_LINE = LOW;  // most modules read LOW over black; flip this if yours are the other way

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(LEFT_SENSOR, INPUT);
  pinMode(RIGHT_SENSOR, INPUT);
}

// Both motors always spin forward; steering is done with speed.
void drive(int leftSpeed, int rightSpeed) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, leftSpeed);
  analogWrite(ENB, rightSpeed);
}

void loop() {
  bool leftOnLine = digitalRead(LEFT_SENSOR) == SEES_LINE;
  bool rightOnLine = digitalRead(RIGHT_SENSOR) == SEES_LINE;

  if (!leftOnLine && !rightOnLine) {
    drive(SPEED, SPEED);   // line is between the sensors: straight on
  } else if (leftOnLine && !rightOnLine) {
    drive(0, SPEED);       // line drifting left: turn left
  } else if (!leftOnLine && rightOnLine) {
    drive(SPEED, 0);       // line drifting right: turn right
  } else {
    drive(0, 0);           // both see the line: a junction or the finish, stop
  }
}`,
  },
  errors: [
    { symptom: 'The robot spins in circles', cause: 'One motor is wired backward, or the sensor logic is inverted.', fix: 'Test with the wheels off the floor. Swap that motor\'s two wires, and flip SEES_LINE if it turns away from the line.' },
    { symptom: 'The motors do not move at all', cause: 'The ENA/ENB jumpers were removed but no PWM wire is connected, or the motor battery is flat or wrongly connected.', fix: 'Check pins 5 and 6 go to ENA and ENB, and check the battery voltage and polarity.' },
    { symptom: 'The Arduino resets when the motors start', cause: 'The motors and the Arduino share a weak supply and it browns out.', fix: 'Power the Arduino separately from the motors and join only the grounds.' },
    { symptom: 'The robot leaves the line on corners', cause: 'It is too fast for the sensors to react.', fix: 'Lower SPEED, and place the sensors closer to the wheels.' },
    { symptom: 'It does not respond to the line', cause: 'The sensor sensitivity is set wrong for your floor and line.', fix: 'Turn the dial on each sensor until its LED lights over black and goes out over white.' },
  ],
  warnings: [
    'Do not power the motors from the Arduino 5V pin; they draw far more current than it can supply.',
    'Join the grounds of the motor supply and the Arduino, or the signals will not work.',
  ],
  verified: false,
};

export const esp32WebLed: LibraryProject = {
  id: 'esp32-web-led',
  name: 'Control an LED from your phone',
  summary: 'The ESP32 hosts a web page on your WiFi with buttons that switch an LED.',
  difficulty: 2,
  minutes: 40,
  boards: ['esp32-devkit-v1'],
  learn: ['Connecting to WiFi', 'Running a web server', 'GPIO numbers on an ESP32'],
  requires: [item('esp32-devkit-v1', 'ESP32 DevKit V1'), led(1), ledResistor(1), BREADBOARD, WIRES],
  wiring: [
    { board: 'GPIO4', part: 'LED long leg (anode)', via: '220 Ω resistor' },
    { board: 'GND', part: 'LED short leg (cathode)' },
  ],
  steps: [
    'In the Arduino IDE add the ESP32 boards (Boards Manager > "esp32" by Espressif) and pick "ESP32 Dev Module".',
    'Wire the LED and resistor to GPIO4 and GND.',
    'Put your WiFi name and password into the sketch, then upload.',
    'Open the Serial Monitor at 115200 baud, wait for the IP address, and open that address in a browser on the same WiFi.',
  ],
  code: {
    file: 'esp32_web_led.ino',
    source: `#include <WiFi.h>
#include <WebServer.h>

const char* WIFI_SSID = "your-network-name";
const char* WIFI_PASSWORD = "your-password";
const int LED_PIN = 4;

WebServer server(80);

void sendPage() {
  server.send(200, "text/html",
    "<h1>Ohmwise LED</h1><p><a href='/on'>Turn on</a> | <a href='/off'>Turn off</a></p>");
}

void turnOn() {
  digitalWrite(LED_PIN, HIGH);
  sendPage();
}

void turnOff() {
  digitalWrite(LED_PIN, LOW);
  sendPage();
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Open http://");
  Serial.println(WiFi.localIP());

  server.on("/", sendPage);
  server.on("/on", turnOn);
  server.on("/off", turnOff);
  server.begin();
}

void loop() {
  server.handleClient();
}`,
  },
  errors: [
    { symptom: 'It never connects (only dots)', cause: 'The name or password is wrong, or the network is 5 GHz. The ESP32 only supports 2.4 GHz.', fix: 'Check the spelling, and use a 2.4 GHz network or a phone hotspot set to 2.4 GHz.' },
    { symptom: 'Upload fails with "Timed out waiting for packet header"', cause: 'The ESP32 is not in download mode.', fix: 'Use the Upload Doctor; usually hold the BOOT button while it says "Connecting".' },
    { symptom: 'The page will not open', cause: 'The phone or computer is on a different network, or the address was typed wrongly.', fix: 'Join the same WiFi and copy the address exactly from the Serial Monitor.' },
    { symptom: 'The LED does not light', cause: 'It is in backwards or on a different pin than the sketch.', fix: 'Long leg toward GPIO4 through the resistor, and check LED_PIN.' },
  ],
  verified: false,
};

export const BUILD_PROJECTS: LibraryProject[] = [lineFollower, esp32WebLed];
