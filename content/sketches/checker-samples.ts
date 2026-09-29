/**
 * Deliberately buggy sketches for the "Check my code" page, one per board
 * family, so a first-time visitor sees the checker find something real.
 */

/** With "Light up an LED" selected: the LED is on pin 9, the sketch drives pin 10. */
export const AVR_SAMPLE = `const int LED_PIN = 10;   // wired to 9?

void setup() {
  Serial.begin(9600);
  pinMode(1, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  analogWrite(4, 100);
  int v = analogRead(9);
}`;

export const ESP32_SAMPLE = `#include <WiFi.h>

void setup() {
  pinMode(34, OUTPUT);
  pinMode(12, INPUT_PULLUP);
  WiFi.begin("network", "password");
}

void loop() {
  int reading = analogRead(4);
  digitalWrite(8, HIGH);
}`;

export const SAMPLES: Record<string, string> = {
  uno: AVR_SAMPLE,
  nano: AVR_SAMPLE,
  'esp32-devkit-v1': ESP32_SAMPLE,
};
