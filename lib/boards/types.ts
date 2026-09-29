import { z } from 'zod';

/**
 * What a board's pins can and cannot do, as data. The sketch linter reads this
 * and nothing else, so adding a board is a new record in `content/boards`, not
 * new code. Drawing coordinates deliberately live elsewhere
 * (`lib/geometry/board.ts`); a board can be linted long before it is drawn.
 *
 * Only verified values belong here. Anything uncertain gets a `// VERIFY:`
 * comment in the board file rather than a guess.
 */

export const pinSpecSchema = z.object({
  /** pinMode / digitalWrite / digitalRead work on this pin. */
  digital: z.boolean(),
  /** The pin can drive an output. False for input-only pins. */
  output: z.boolean(),
  /** Hardware PWM (matters on boards where analogWrite needs it). */
  pwm: z.boolean().optional(),
  /** ADC unit. `adc2` is unusable while WiFi is running on an ESP32. */
  adc: z.enum(['adc', 'adc1', 'adc2']).optional(),
  /** False when the pin has no internal pull-up or pull-down resistor. */
  pullups: z.boolean().optional(),
  /** attachInterrupt works on this pin. */
  interrupt: z.boolean(),
  /** Read at boot to choose a mode; external circuits can stop it booting. */
  strapping: z.object({ note: z.string().min(1), level: z.enum(['warning', 'info']) }).optional(),
  /** Wired to something inside the module and not free to use. */
  reserved: z.string().optional(),
  /** Shared with the USB serial connection (Serial, uploads). */
  uart: z.string().optional(),
});

export const boardSpecSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  family: z.enum(['avr', 'esp32']),
  mcu: z.string().min(1),
  logicVoltage: z.number(),
  /** Pin number as written in a sketch -> what it can do. */
  pins: z.record(z.string().regex(/^\d+$/), pinSpecSchema),
  /** analogWrite only produces PWM on pins marked `pwm`; elsewhere it is on/off. */
  pwmRestricted: z.boolean(),
  /** Named constants a sketch may use in place of a number. */
  aliases: z.record(z.string(), z.number().int()),
  builtinLedPin: z.number().int(),
  /** On AVR, analogRead(n) accepts a channel number 0..count-1 as well as A0.. */
  avrAnalog: z.object({ base: z.number().int(), count: z.number().int() }).optional(),
  /** Where the pin data came from. */
  source: z.string().min(1),
});

export type PinSpec = z.infer<typeof pinSpecSchema>;
export type BoardSpec = z.infer<typeof boardSpecSchema>;

/** Pin numbers a sketch can safely use, sorted. */
export function usablePins(board: BoardSpec): number[] {
  return Object.entries(board.pins)
    .filter(([, spec]) => !spec.reserved)
    .map(([n]) => Number(n))
    .sort((a, b) => a - b);
}
