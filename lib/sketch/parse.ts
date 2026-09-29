/**
 * A small, forgiving reader for Arduino sketches. It is not a C++ parser: it
 * finds the calls that name a pin, works out which pin when that is knowable,
 * and says nothing when it is not. Guessing here would turn into false alarms
 * for a student, so an expression we cannot resolve is reported as unresolved
 * and the linter stays quiet about it.
 */

export type PinFn =
  | 'pinMode'
  | 'digitalWrite'
  | 'digitalRead'
  | 'analogWrite'
  | 'analogRead'
  | 'tone'
  | 'pulseIn'
  | 'attach'
  | 'attachInterrupt';

export interface PinCall {
  fn: PinFn;
  /** 1-based line in the original sketch. */
  line: number;
  /** The pin as resolved to a number, or null when it cannot be known. */
  pin: number | null;
  /** For pinMode: the mode argument as written (OUTPUT, INPUT_PULLUP, ...). */
  mode?: string;
}

export interface SketchInfo {
  calls: PinCall[];
  usesSerial: boolean;
  usesWifi: boolean;
  /** A pinMode() whose pin we could not resolve (a loop over pins, say). */
  hasUnresolvedPinMode: boolean;
}

/**
 * Blanks out comments and string/char literals, keeping every newline, so that
 * offsets and line numbers in the result match the original text.
 */
export function stripCode(src: string): string {
  let out = '';
  let i = 0;
  const blank = (s: string) => s.replace(/[^\n]/g, ' ');
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === '/' && n === '/') {
      const end = src.indexOf('\n', i);
      const stop = end === -1 ? src.length : end;
      out += blank(src.slice(i, stop));
      i = stop;
    } else if (c === '/' && n === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += blank(src.slice(i, stop));
      i = stop;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c && src[j] !== '\n') {
        if (src[j] === '\\') j++;
        j++;
      }
      const stop = Math.min(j + 1, src.length);
      out += blank(src.slice(i, stop));
      i = stop;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

const TYPES = 'int|byte|uint8_t|uint16_t|int8_t|int16_t|short|long|gpio_num_t';
const DECL = new RegExp(
  `(?:^|[;{}(\\s])(?:(?:const|static|constexpr|volatile|unsigned)\\s+)*(?:${TYPES})\\s+(\\w+)\\s*=\\s*([^;,)]+)`,
  'g',
);
const DEFINE = /^[ \t]*#[ \t]*define[ \t]+(\w+)[ \t]+(.+?)[ \t]*$/gm;

/** name -> expression text, for names that are set once and never reassigned. */
function collectConstants(code: string): Map<string, string> {
  const found = new Map<string, string[]>();
  const push = (name: string, value: string) => {
    const list = found.get(name);
    if (list) list.push(value.trim());
    else found.set(name, [value.trim()]);
  };

  for (const m of code.matchAll(DECL)) push(m[1], m[2]);
  for (const m of code.matchAll(DEFINE)) push(m[1], m[2]);

  const out = new Map<string, string>();
  for (const [name, values] of found) {
    if (new Set(values).size !== 1) continue; // declared twice with different values
    const assigns = [...code.matchAll(new RegExp(`(?<![\\w.>])${name}\\s*=(?!=)`, 'g'))].length;
    const declared = values.length;
    // #define has no "=", so it contributes 0 assignments.
    const defineCount = [...code.matchAll(new RegExp(`#[ \\t]*define[ \\t]+${name}\\b`, 'g'))].length;
    if (assigns > declared - defineCount) continue; // reassigned somewhere
    // A loop counter or anything else changed in place is not a constant either.
    const changed = new RegExp(
      `(?<![\\w.>])${name}\\s*(?:\\+\\+|--|[-+*/%|&^]=)|(?:\\+\\+|--)\\s*${name}\\b`,
    );
    if (changed.test(code)) continue;
    out.set(name, values[0]);
  }
  return out;
}

function resolve(
  expr: string,
  consts: Map<string, string>,
  aliases: Record<string, number>,
  seen: Set<string> = new Set(),
): number | null {
  let e = expr.trim();
  // Strip a cast like (int) or (uint8_t) and surrounding parentheses.
  for (;;) {
    const cast = e.match(
      /^\(\s*(?:const\s+)?(?:unsigned\s+)?(?:int|byte|uint8_t|uint16_t|short|long|char)\s*\)\s*(.+)$/,
    );
    if (cast) {
      e = cast[1].trim();
      continue;
    }
    const paren = e.match(/^\(\s*(.+)\s*\)$/);
    if (paren) {
      e = paren[1].trim();
      continue;
    }
    break;
  }
  e = e.replace(/[uUlL]+$/, '');

  if (/^\d+$/.test(e)) return Number(e);
  if (/^0[xX][0-9a-fA-F]+$/.test(e)) return parseInt(e, 16);
  const gpio = e.match(/^GPIO_NUM_(\d+)$/);
  if (gpio) return Number(gpio[1]);
  if (/^[A-Za-z_]\w*$/.test(e)) {
    if (e in aliases) return aliases[e];
    if (seen.has(e)) return null;
    const value = consts.get(e);
    if (value === undefined) return null;
    return resolve(value, consts, aliases, new Set(seen).add(e));
  }
  return null;
}

/** Reads a call's arguments, splitting on top-level commas. Returns null if unbalanced. */
function readArgs(code: string, open: number): string[] | null {
  let depth = 0;
  let cur = '';
  const args: string[] = [];
  for (let i = open; i < code.length; i++) {
    const c = code[i];
    if (c === '(') {
      depth++;
      if (depth === 1) continue;
    } else if (c === ')') {
      depth--;
      if (depth === 0) {
        if (cur.trim() || args.length) args.push(cur.trim());
        return args;
      }
    } else if (c === ',' && depth === 1) {
      args.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  return null;
}

const CALL =
  /\b(pinMode|digitalWrite|digitalRead|analogWrite|analogRead|tone|pulseIn|attach|attachInterrupt)\s*\(/g;

const lineAt = (code: string, index: number) => code.slice(0, index).split('\n').length;

export function parseSketch(source: string, aliases: Record<string, number>): SketchInfo {
  const code = stripCode(source);
  const consts = collectConstants(code);
  const calls: PinCall[] = [];
  let hasUnresolvedPinMode = false;

  for (const m of code.matchAll(CALL)) {
    const fn = m[1] as PinFn;
    const open = m.index! + m[0].length - 1;
    const args = readArgs(code, open);
    if (!args || args.length === 0) continue;

    let pinExpr = args[0];
    if (fn === 'attachInterrupt') {
      // attachInterrupt(digitalPinToInterrupt(PIN), isr, mode). A bare interrupt
      // number means something different per board, so leave that unresolved.
      const inner = pinExpr.match(/^digitalPinToInterrupt\s*\((.*)\)$/);
      pinExpr = inner ? inner[1] : '';
    }

    const pin = pinExpr ? resolve(pinExpr, consts, aliases) : null;
    const call: PinCall = { fn, line: lineAt(code, m.index!), pin };
    if (fn === 'pinMode') {
      call.mode = args[1]?.trim();
      if (pin === null) hasUnresolvedPinMode = true;
    }
    calls.push(call);
  }

  return {
    calls,
    usesSerial: /\bSerial\s*\./.test(code),
    usesWifi:
      /#\s*include\s*<\s*WiFi\w*\.h\s*>/.test(code) ||
      /\bWiFi\s*\.\s*(begin|mode|softAP)\b/.test(code) ||
      /\besp_now_init\b/.test(code),
    hasUnresolvedPinMode,
  };
}
