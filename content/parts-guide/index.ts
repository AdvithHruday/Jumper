import type { PartGuide } from '@/lib/parts/types';
import { breadboard, esp32, jumperWires, nano, res10k, res1k, res220, res330, res470, uno } from './boards-basics';
import { buzzer, ldr, led, potentiometer, pushButton, rgbLed } from './electronics';
import { dht11, hcsr04, irLine, lcd, pir, soil } from './modules';
import { batteryPack, chassis, dcMotor, l298n, servo } from './motion-power';

/** One guide for every part in the library. A test requires exactly one per library item. */
export const PART_GUIDES: PartGuide[] = [
  uno,
  nano,
  esp32,
  breadboard,
  jumperWires,
  res220,
  res330,
  res470,
  res1k,
  res10k,
  led,
  rgbLed,
  buzzer,
  pushButton,
  potentiometer,
  ldr,
  hcsr04,
  dht11,
  pir,
  irLine,
  soil,
  servo,
  l298n,
  dcMotor,
  chassis,
  lcd,
  batteryPack,
];
