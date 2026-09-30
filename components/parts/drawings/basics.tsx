import { BAND_COLORS, LED_COLORS } from '@/components/diagram/parts';
import { P } from './palette';
import type { DrawingSpec } from './types';

/** A through-hole resistor: two leads and a body with four colour bands. */
export const resistor: DrawingSpec = {
  anchors: { 'first-band': [58, 50], 'last-band': [102, 50], lead: [24, 50] },
  render: ({ bands = ['red', 'red', 'brown', 'gold'] }) => {
    const xs = [56, 68, 80, 100];
    return (
      <>
        <line x1="14" y1="50" x2="146" y2="50" stroke={P.lead} strokeWidth="3" strokeLinecap="round" />
        <rect x="42" y="34" width="76" height="32" rx="15" fill={P.resistorBody} stroke={P.resistorEdge} strokeWidth="1.5" />
        {bands.slice(0, 4).map((b, i) => (
          <rect key={i} x={xs[i]} y="34" width="6" height="32" fill={BAND_COLORS[b] ?? '#222'} />
        ))}
      </>
    );
  },
};

/** A 5 mm LED: a domed body, a long leg (anode) and a short leg (cathode), and a flat edge on the cathode side. */
export const led: DrawingSpec = {
  anchors: { 'long-leg': [64, 92], 'short-leg': [96, 84], 'flat-edge': [103, 42], dome: [78, 38] },
  render: () => (
    <>
      <path d="M66 62 L63 94 M94 62 L96 86" stroke={P.lead} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="40" r="24" fill={LED_COLORS.red} fillOpacity=".5" stroke={LED_COLORS.red} strokeWidth="2.5" />
      <circle cx="71" cy="31" r="6" fill="#fff" opacity=".55" />
      <line x1="103" y1="30" x2="103" y2="52" stroke="#333" strokeWidth="3" />
      <text x="50" y="92" fontSize="14" fontWeight="800" fill={P.accent} textAnchor="middle" fontFamily="sans-serif">
        +
      </text>
    </>
  ),
};

/** A common-cathode RGB LED: one dome, three colours, four legs, the longest one shared. */
export const rgbLed: DrawingSpec = {
  anchors: { 'common-leg': [72, 95], 'red-leg': [56, 88], 'green-leg': [88, 88], 'blue-leg': [104, 88], dome: [80, 38] },
  render: () => (
    <>
      <path
        d="M56 62 L56 88 M72 62 L72 95 M88 62 L88 88 M104 62 L104 88"
        stroke={P.lead}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="80" cy="40" r="24" fill="#DDE7EC" fillOpacity=".55" stroke="#DDE7EC" strokeWidth="2.5" />
      <circle cx="70" cy="42" r="6" fill="#E8322D" />
      <circle cx="82" cy="33" r="6" fill="#33C46A" />
      <circle cx="92" cy="45" r="6" fill="#3B7BE8" />
      <line x1="103" y1="30" x2="103" y2="52" stroke="#333" strokeWidth="3" />
    </>
  ),
};

/** An active buzzer: a black cylinder with a sound hole, a plus mark and a sealed underside. */
export const buzzer: DrawingSpec = {
  anchors: { 'plus-mark': [58, 26], 'sound-hole': [80, 42], 'long-leg': [66, 92] },
  render: () => (
    <>
      <path d="M66 68 L66 94 M94 68 L94 84" stroke={P.lead} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="42" r="32" fill={P.plastic} stroke={P.plasticEdge} strokeWidth="2" />
      <circle cx="80" cy="42" r="26" fill="none" stroke={P.plasticGrey} strokeWidth="1.5" />
      <circle cx="80" cy="42" r="5" fill="#000" />
      <text x="58" y="30" fontSize="16" fontWeight="800" fill={P.silver} textAnchor="middle" fontFamily="sans-serif">
        +
      </text>
    </>
  ),
};

/** A 6 mm tactile push button: a square body, a round cap and four legs. */
export const pushButton: DrawingSpec = {
  anchors: { cap: [80, 48], 'leg-top-left': [42, 30], 'leg-bottom-right': [118, 68] },
  render: () => (
    <>
      <path
        d="M56 30 h-14 M56 68 h-14 M104 30 h14 M104 68 h14"
        stroke={P.silver}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="54" y="22" width="52" height="52" rx="7" fill={P.plasticGrey} stroke="#25282C" strokeWidth="2" />
      <circle cx="80" cy="48" r="17" fill="#1E2124" stroke="#555A60" strokeWidth="2.5" />
    </>
  ),
};

/** A 10 k rotary potentiometer: a knob on a square body and three legs. */
export const potentiometer: DrawingSpec = {
  anchors: { knob: [80, 40], wiper: [80, 92], 'outer-left': [60, 92], 'outer-right': [100, 92] },
  render: () => (
    <>
      <path d="M60 68 L60 94 M80 68 L80 94 M100 68 L100 94" stroke={P.silver} strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="48" y="14" width="64" height="56" rx="6" fill={P.pcbBlue} stroke={P.pcbBlueEdge} strokeWidth="2" />
      <circle cx="80" cy="40" r="20" fill={P.silver} stroke={P.silverEdge} strokeWidth="2" />
      <circle cx="80" cy="40" r="13" fill={P.silverDark} />
      <line x1="80" y1="28" x2="80" y2="52" stroke="#4A5257" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
};

/** A light-dependent resistor: a flat disc with a wavy track and two long legs. */
export const ldr: DrawingSpec = {
  anchors: { face: [80, 40], 'leg-left': [66, 93], 'leg-right': [94, 93] },
  render: () => (
    <>
      <path d="M66 62 L66 94 M94 62 L94 94" stroke={P.lead} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="40" r="28" fill={P.ldr} stroke={P.ldrEdge} strokeWidth="2.5" />
      <path
        d="M60 32 H100 M100 32 V38 H60 V44 H100 V50 H60 M60 32 V26 M100 50 V56"
        stroke="#2A1B08"
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
    </>
  ),
};
