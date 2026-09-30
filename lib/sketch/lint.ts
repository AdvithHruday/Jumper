import type { BoardSpec, PinSpec } from '@/lib/boards/types';
import { usablePins } from '@/lib/boards/types';
import { parseSketch, type PinCall, type SketchInfo } from './parse';

/**
 * Deterministic checks of a sketch against a board's pin data (and, optionally,
 * the wiring of a guide project). Same sketch, same findings, no model in the
 * loop. Adding a rule is appending to RULES; existing rules are not edited to
 * make a new one fit.
 */

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintFinding {
  severity: LintSeverity;
  /** Stable id, used by tests and the UI. */
  rule: string;
  message: string;
  /** 1-based line in the sketch, when the finding points at one. */
  line?: number;
  link?: { href: string; label: string };
}

/** What a guide project's circuit connects to which board pins. */
export interface ExpectedWiring {
  label: string;
  outputs: { pin: number; what: string }[];
}

export interface LintContext {
  board: BoardSpec;
  info: SketchInfo;
  wiring?: ExpectedWiring;
  /** Calls with the pin normalised to the board's digital numbering. */
  calls: (PinCall & { spec?: PinSpec })[];
}

export type LintRule = (ctx: LintContext) => LintFinding[];

const UPLOAD_LINK = { href: '/fix/upload', label: 'Upload Doctor' };

/** analogRead(0) means A0 on AVR boards; normalise so every rule sees pin 14. */
function normalise(board: BoardSpec, call: PinCall): number | null {
  if (call.pin === null) return null;
  if (board.avrAnalog && call.fn === 'analogRead' && call.pin >= 0 && call.pin < board.avrAnalog.count) {
    return board.avrAnalog.base + call.pin;
  }
  return call.pin;
}

const needsDigital = (fn: PinCall['fn']) =>
  fn === 'pinMode' || fn === 'digitalWrite' || fn === 'digitalRead' || fn === 'tone';

function drivesOutput(call: PinCall): boolean {
  if (call.fn === 'digitalWrite' || call.fn === 'analogWrite' || call.fn === 'tone') return true;
  return call.fn === 'pinMode' && call.mode === 'OUTPUT';
}

function pinRange(board: BoardSpec): string {
  if (board.family === 'avr') {
    const { base, count } = board.avrAnalog ?? { base: 14, count: 6 };
    return `pins 0 to ${base - 1} and A0 to A${count - 1}`;
  }
  return `GPIO ${usablePins(board).join(', ')}`;
}

/** First call per pin for rules that should not repeat themselves. */
function firstPerPin<T extends { pin: number | null }>(calls: T[]): (T & { pin: number })[] {
  const seen = new Set<number>();
  const out: (T & { pin: number })[] = [];
  for (const c of calls) {
    if (c.pin === null || seen.has(c.pin)) continue;
    seen.add(c.pin);
    out.push(c as T & { pin: number });
  }
  return out;
}

const pinName = (board: BoardSpec, n: number) => (board.family === 'esp32' ? `GPIO${n}` : `pin ${n}`);

export const pinNotOnBoard: LintRule = ({ board, calls }) =>
  calls
    .filter((c) => c.pin !== null && !c.spec)
    .map((c) => ({
      severity: 'error' as const,
      rule: 'pin-not-on-board',
      line: c.line,
      message: `${c.fn}(${c.pin}) uses ${pinName(board, c.pin!)}, which does not exist on the ${board.name}. Nothing warns you about this at compile time; the call just does the wrong thing. Use ${pinRange(board)}.`,
    }));

export const pinReserved: LintRule = ({ board, calls }) =>
  firstPerPin(calls.filter((c) => c.spec?.reserved)).map((c) => ({
    severity: 'error' as const,
    rule: 'pin-reserved',
    line: c.line,
    message: `${pinName(board, c.pin)} is not free to use: ${c.spec!.reserved}. Using it can crash the board. Pick another pin.`,
  }));

export const analogOnlyPin: LintRule = ({ board, calls }) =>
  calls
    .filter((c) => c.spec && !c.spec.reserved && needsDigital(c.fn) && !c.spec.digital)
    .map((c) => ({
      severity: 'error' as const,
      rule: 'analog-only-pin',
      line: c.line,
      message: `${c.fn}() cannot be used on ${pinName(board, c.pin!)}: on the ${board.name} it is an analog input only, with no digital function. Use analogRead(), or move the part to a pin that supports digital I/O.`,
    }));

export const inputOnlyPin: LintRule = ({ board, calls }) =>
  calls
    .filter((c) => c.spec && !c.spec.reserved && c.spec.output === false && c.spec.digital && drivesOutput(c))
    .map((c) => ({
      severity: 'error' as const,
      rule: 'input-only-pin',
      line: c.line,
      message: `${c.fn}() tries to drive ${pinName(board, c.pin!)} as an output, but that pin is input-only on the ${board.name}. It will never switch. Use an output-capable pin.`,
    }));

export const noInternalPullup: LintRule = ({ board, calls }) =>
  calls
    .filter(
      (c) =>
        c.fn === 'pinMode' &&
        c.spec?.digital &&
        c.spec.pullups === false &&
        (c.mode === 'INPUT_PULLUP' || c.mode === 'INPUT_PULLDOWN'),
    )
    .map((c) => ({
      severity: 'warning' as const,
      rule: 'no-internal-pullup',
      line: c.line,
      message: `${pinName(board, c.pin!)} has no internal pull resistor, so ${c.mode} does nothing there. Add an external 10 kΩ resistor, or use a pin that has one.`,
    }));

export const analogWriteNotPwm: LintRule = ({ board, calls }) =>
  !board.pwmRestricted
    ? []
    : calls
        .filter((c) => c.fn === 'analogWrite' && c.spec?.digital && !c.spec.pwm)
        .map((c) => {
          const pwm = Object.entries(board.pins)
            .filter(([, s]) => s.pwm)
            .map(([n]) => n)
            .join(', ');
          return {
            severity: 'warning' as const,
            rule: 'analogwrite-not-pwm',
            line: c.line,
            message: `analogWrite() on ${pinName(board, c.pin!)} only switches fully on or fully off: that pin has no PWM on the ${board.name}, so dimming and fading will not work. PWM pins are ${pwm}.`,
          };
        });

export const analogReadNotAnalog: LintRule = ({ board, calls }) =>
  calls
    .filter((c) => c.fn === 'analogRead' && c.spec && !c.spec.reserved && !c.spec.adc)
    .map((c) => ({
      severity: 'error' as const,
      rule: 'analogread-not-analog',
      line: c.line,
      message: `analogRead() on ${pinName(board, c.pin!)} reads nothing useful: that pin has no analog input on the ${board.name}.${board.family === 'avr' ? ' Use A0 to A5.' : ' Use an ADC pin such as GPIO32-39.'}`,
    }));

export const adc2WithWifi: LintRule = ({ board, calls, info }) =>
  !info.usesWifi
    ? []
    : calls
        .filter((c) => c.fn === 'analogRead' && c.spec?.adc === 'adc2')
        .map((c) => ({
          severity: 'error' as const,
          rule: 'adc2-with-wifi',
          line: c.line,
          message: `analogRead() on ${pinName(board, c.pin!)} fails while WiFi is running: that pin is on ADC2, which the WiFi radio takes over. There is no error message, the reading is just wrong. Move the sensor to an ADC1 pin (GPIO32, 33, 34, 35, 36 or 39).`,
        }));

export const interruptPin: LintRule = ({ board, calls }) =>
  calls
    .filter((c) => c.fn === 'attachInterrupt' && c.spec && !c.spec.reserved && !c.spec.interrupt)
    .map((c) => ({
      severity: 'error' as const,
      rule: 'interrupt-pin',
      line: c.line,
      message: `attachInterrupt() does not work on ${pinName(board, c.pin!)} of the ${board.name}. The interrupt never fires. ${board.family === 'avr' ? 'Use pin 2 or 3.' : 'Pick an input-capable pin.'}`,
    }));

export const strappingPin: LintRule = ({ calls }) =>
  firstPerPin(calls.filter((c) => c.spec?.strapping)).map((c) => ({
    severity: c.spec!.strapping!.level,
    rule: 'strapping-pin',
    line: c.line,
    message: c.spec!.strapping!.note,
  }));

export const uartPinInUse: LintRule = ({ board, calls, info }) =>
  firstPerPin(calls.filter((c) => c.spec?.uart)).map((c) => ({
    severity: info.usesSerial ? ('error' as const) : ('warning' as const),
    rule: 'uart-pin-in-use',
    line: c.line,
    message: info.usesSerial
      ? `${pinName(board, c.pin)} is also used by Serial (${c.spec!.uart}). Using it as a normal pin while the sketch prints to the Serial Monitor corrupts both, and anything wired to it can make uploads fail.`
      : `${pinName(board, c.pin)} is shared with the USB connection (${c.spec!.uart}). Anything wired to it can make uploads fail, and Serial stops working. Use a different pin.`,
    link: UPLOAD_LINK,
  }));

export const missingPinMode: LintRule = ({ board, calls, info }) => {
  if (info.hasUnresolvedPinMode) return []; // pins set in a loop or by a variable: cannot tell
  const modeSet = new Set(calls.filter((c) => c.fn === 'pinMode' && c.pin !== null).map((c) => c.pin));
  return firstPerPin(calls.filter((c) => c.fn === 'digitalWrite' && c.spec?.digital && !modeSet.has(c.pin)))
    .map((c) => ({
      severity: 'warning' as const,
      rule: 'missing-pinmode',
      line: c.line,
      message: `digitalWrite() on ${pinName(board, c.pin)} but the sketch never calls pinMode(${c.pin}, OUTPUT). ${board.family === 'avr' ? 'The pin only turns a weak pull-up on, so an LED glows dimly or not at all.' : 'The pin is not set up as an output, so nothing happens.'} Add it inside setup().`,
    }));
};

/** The circuit wires something to a pin the sketch never drives, or the reverse. */
export const wiringMismatch: LintRule = ({ board, calls, wiring }) => {
  if (!wiring || wiring.outputs.length === 0) return [];
  const writes = calls.filter((c) => c.fn === 'digitalWrite' || c.fn === 'analogWrite' || c.fn === 'tone');
  if (writes.some((c) => c.pin === null)) return []; // a pin we cannot resolve: stay quiet
  const written = new Set(writes.map((c) => c.pin as number));
  const findings: LintFinding[] = [];

  for (const out of wiring.outputs) {
    if (written.has(out.pin)) continue;
    const list = [...written].sort((a, b) => a - b);
    findings.push({
      severity: 'error',
      rule: 'wired-pin-not-driven',
      message: `${wiring.label} connects ${out.what} to pin ${out.pin}, but your sketch never writes to pin ${out.pin}${list.length ? ` (it writes to ${list.map((n) => `pin ${n}`).join(', ')})` : ''}. Change the pin number in the sketch or move the wire, so the code and the wiring use the same pin.`,
    });
  }

  const expected = new Set(wiring.outputs.map((o) => o.pin));
  for (const c of firstPerPin(writes)) {
    if (expected.has(c.pin) || c.pin === board.builtinLedPin) continue;
    findings.push({
      severity: 'warning',
      rule: 'driven-pin-not-wired',
      line: c.line,
      message: `Your sketch drives pin ${c.pin}, but nothing in ${wiring.label} is wired to it. If you changed the wiring on purpose this is fine; otherwise the part will not respond.`,
    });
  }
  return findings;
};

export const RULES: LintRule[] = [
  pinNotOnBoard,
  pinReserved,
  analogOnlyPin,
  inputOnlyPin,
  noInternalPullup,
  analogWriteNotPwm,
  analogReadNotAnalog,
  adc2WithWifi,
  interruptPin,
  strappingPin,
  uartPinInUse,
  missingPinMode,
  wiringMismatch,
];

/**
 * Capitalises the first word of a message, unless it is code. `analogRead()` and
 * `pinMode(...)` are case-sensitive, so a message that opens with one must keep
 * its spelling: "AnalogRead()" would teach a student a call that does not exist.
 */
export function sentenceCase(message: string): string {
  const word = message.match(/^[A-Za-z_][A-Za-z0-9_]*/)?.[0];
  if (!word) return message;
  const isPlainWord = word === word.toLowerCase() && message[word.length] !== '(';
  return isPlainWord ? word.charAt(0).toUpperCase() + message.slice(1) : message;
}

const ORDER: Record<LintSeverity, number> = { error: 0, warning: 1, info: 2 };

export interface LintOptions {
  wiring?: ExpectedWiring;
  rules?: LintRule[];
}

export function lintSketch(source: string, board: BoardSpec, opts: LintOptions = {}): LintFinding[] {
  const info = parseSketch(source, board.aliases);
  const calls = info.calls.map((c) => {
    const pin = normalise(board, c);
    return { ...c, pin, spec: pin === null ? undefined : board.pins[String(pin)] };
  });
  const ctx: LintContext = { board, info, wiring: opts.wiring, calls };
  return (opts.rules ?? RULES)
    .flatMap((rule) => rule(ctx))
    .map((f) => ({ ...f, message: sentenceCase(f.message) }))
    .sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || (a.line ?? 0) - (b.line ?? 0));
}
