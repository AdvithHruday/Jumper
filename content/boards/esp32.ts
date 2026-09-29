import type { BoardSpec, PinSpec } from '@/lib/boards/types';

/**
 * ESP32 DevKit V1 (ESP32-WROOM-32). Pins are addressed by GPIO number, which
 * is what the Arduino-ESP32 core expects in digitalWrite() and friends.
 *
 * Sources: Espressif ESP32 datasheet (strapping pins, ADC channels, input-only
 * GPIO34-39, flash pins GPIO6-11), and the Arduino-ESP32 documentation (ADC2
 * cannot be used while WiFi is running).
 */

/** GPIO usable as a plain input and output. */
const IO = [4, 13, 14, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33];
const ADC1 = new Set([32, 33, 34, 35, 36, 39]);
const ADC2 = new Set([0, 2, 4, 12, 13, 14, 15, 25, 26, 27]);
const INPUT_ONLY = [34, 35, 36, 39];
const FLASH = [6, 7, 8, 9, 10, 11];

const STRAPPING: Record<number, NonNullable<PinSpec['strapping']>> = {
  0: {
    level: 'warning',
    note: 'GPIO0 is read at boot: held LOW it puts the chip in download mode instead of running your sketch. Do not wire anything that pulls it low at power-up.',
  },
  2: {
    level: 'info',
    note: 'GPIO2 must be LOW or floating to enter download mode, so a wired part can stop uploads. It is fine as an output once running (it drives the on-board LED on many boards).',
  },
  5: {
    level: 'info',
    note: 'GPIO5 is a boot-time strapping pin (it sets a timing option); avoid strong pull-downs on it.',
  },
  12: {
    level: 'warning',
    note: 'GPIO12 (MTDI) selects the flash voltage at boot. Held HIGH at power-up on a 3.3 V flash module (such as the WROOM-32) it can make the board fail to boot or reset in a loop.',
  },
  15: {
    level: 'warning',
    note: 'GPIO15 (MTDO) is a boot-time strapping pin: pulled LOW it silences boot messages, and it must not be held low in a way your circuit does not expect.',
  },
};

const pins: Record<string, PinSpec> = {};

function add(n: number, extra: Partial<PinSpec> = {}): void {
  const spec: PinSpec = { digital: true, output: true, interrupt: true, ...extra };
  if (ADC1.has(n)) spec.adc = 'adc1';
  if (ADC2.has(n)) spec.adc = 'adc2';
  if (STRAPPING[n]) spec.strapping = STRAPPING[n];
  pins[String(n)] = spec;
}

for (const n of [0, 2, 5, 12, 15, ...IO]) add(n);
add(1, { uart: 'GPIO1 is TX0, the USB serial connection (Serial)' });
add(3, { uart: 'GPIO3 is RX0, the USB serial connection (Serial)' });
for (const n of INPUT_ONLY) add(n, { output: false, pullups: false });
for (const n of FLASH) {
  pins[String(n)] = {
    digital: false,
    output: false,
    interrupt: false,
    reserved: "it is connected to the module's flash memory",
  };
}

export const esp32DevkitV1: BoardSpec = {
  id: 'esp32-devkit-v1',
  name: 'ESP32 DevKit V1',
  family: 'esp32',
  mcu: 'ESP32-WROOM-32',
  logicVoltage: 3.3,
  pins,
  // Arduino-ESP32 3.x provides analogWrite() on any output-capable GPIO.
  pwmRestricted: false,
  // VERIFY: LED_BUILTIN is GPIO2 in the ESP32 Dev Module variant; some DevKit
  // clones have the LED on another pin or none at all.
  aliases: { LED_BUILTIN: 2 },
  builtinLedPin: 2,
  source:
    'Espressif ESP32 datasheet and DevKitC docs (strapping, ADC, flash pins); Arduino-ESP32 docs (ADC2 and WiFi)',
};
