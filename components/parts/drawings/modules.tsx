import { P } from './palette';
import type { DrawingSpec } from './types';

const pin = (x: number, y: number, key?: string | number) => (
  <rect key={key ?? `${x}-${y}`} x={x} y={y} width="5" height="9" fill={P.gold} />
);

/** An HC-SR04 ultrasonic sensor: a blue board, two silver transducers like eyes, and four pins along the bottom. */
export const hcsr04: DrawingSpec = {
  anchors: {
    transmitter: [54, 46],
    receiver: [106, 46],
    pins: [79, 90],
  },
  render: () => (
    <>
      <rect x="20" y="16" width="120" height="62" rx="4" fill={P.pcbBlue} stroke={P.pcbBlueEdge} strokeWidth="2" />
      <circle cx="54" cy="46" r="20" fill={P.silver} stroke={P.silverEdge} strokeWidth="2.5" />
      <circle cx="54" cy="46" r="12" fill={P.silverDark} />
      <circle cx="106" cy="46" r="20" fill={P.silver} stroke={P.silverEdge} strokeWidth="2.5" />
      <circle cx="106" cy="46" r="12" fill={P.silverDark} />
      <rect x="74" y="34" width="12" height="9" rx="1" fill={P.plastic} />
      <rect x="76" y="50" width="8" height="5" rx="1" fill={P.silver} />
      {[62, 72, 82, 92].map((x) => pin(x, 78, x))}
    </>
  ),
};

/** A DHT11 module: a blue sensor block with a grid of slits, on a small board with three pins. */
export const dht11: DrawingSpec = {
  anchors: { sensor: [80, 34], pins: [80, 92] },
  render: () => (
    <>
      <rect x="52" y="60" width="56" height="28" rx="3" fill={P.pcbBlue} stroke={P.pcbBlueEdge} strokeWidth="2" />
      <rect x="56" y="10" width="48" height="52" rx="3" fill="#3F8FD6" stroke="#2A6BA8" strokeWidth="2" />
      {[18, 24, 30, 36, 42, 48].map((y) => (
        <line key={y} x1="62" y1={y} x2="98" y2={y} stroke="#2A6BA8" strokeWidth="2.4" strokeLinecap="round" />
      ))}
      {[62, 80, 98].map((x) => pin(x - 2, 88, x))}
    </>
  ),
};

/** An HC-SR501 PIR sensor: a white dome lens on a green board, two orange adjustment dials, three pins. */
export const pir: DrawingSpec = {
  anchors: { lens: [80, 42], 'dial-left': [44, 72], 'dial-right': [116, 72], pins: [80, 92] },
  render: () => (
    <>
      <rect x="26" y="14" width="108" height="72" rx="5" fill={P.pcbGreen} stroke={P.pcbGreenEdge} strokeWidth="2" />
      <circle cx="80" cy="42" r="26" fill="#F7F7F2" stroke="#C9C9BE" strokeWidth="2.5" />
      <path d="M80 18 V66 M56 42 H104 M63 25 L97 59 M97 25 L63 59" stroke="#DADAD0" strokeWidth="1.6" />
      <circle cx="44" cy="72" r="8" fill="#E98A1C" stroke="#B36510" strokeWidth="1.5" />
      <path d="M40 72 H48 M44 68 V76" stroke="#7A4308" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="116" cy="72" r="8" fill="#E98A1C" stroke="#B36510" strokeWidth="1.5" />
      <path d="M112 72 H120 M116 68 V76" stroke="#7A4308" strokeWidth="1.6" strokeLinecap="round" />
      {[70, 80, 90].map((x) => pin(x - 2, 86, x))}
    </>
  ),
};

/** An IR line sensor: a clear emitter and a dark receiver facing down, a blue adjustment dial, and a header. */
export const irLine: DrawingSpec = {
  anchors: { emitter: [64, 76], receiver: [96, 76], dial: [80, 36], pins: [80, 10] },
  render: () => (
    <>
      <rect x="34" y="8" width="92" height="9" fill="#1A1A1A" />
      {[64, 76, 88, 100].map((x) => (
        <rect key={x} x={x - 2} y="12" width="4" height="8" fill={P.gold} />
      ))}
      <rect x="34" y="18" width="92" height="52" rx="4" fill={P.pcbBlue} stroke={P.pcbBlueEdge} strokeWidth="2" />
      <rect x="66" y="26" width="28" height="20" rx="2" fill="#2F7DC4" stroke="#1F5FA8" />
      <circle cx="80" cy="36" r="6" fill={P.silver} stroke={P.silverEdge} />
      <path d="M77 36 H83" stroke="#4A5257" strokeWidth="2" strokeLinecap="round" />
      <rect x="54" y="70" width="20" height="16" rx="3" fill="#E6EEF2" stroke="#AFC0C9" strokeWidth="1.5" />
      <rect x="86" y="70" width="20" height="16" rx="3" fill="#2A2D31" stroke="#0E0F11" strokeWidth="1.5" />
    </>
  ),
};

/** A soil moisture probe: a fork-shaped board with two prongs, and a header at the top. */
export const soil: DrawingSpec = {
  anchors: { prongs: [80, 66], pins: [80, 10] },
  render: () => (
    <>
      <rect x="54" y="6" width="52" height="8" fill="#1A1A1A" />
      {[64, 74, 86, 96].map((x) => (
        <rect key={x} x={x - 2} y="8" width="4" height="10" fill={P.gold} />
      ))}
      <path d="M52 16 H108 V40 H98 V84 L92 92 L86 84 V40 H74 V84 L68 92 L62 84 V40 H52 Z" fill={P.pcbBlack} stroke={P.pcbBlackEdge} strokeWidth="2" strokeLinejoin="round" />
      <path d="M68 44 V82 M92 44 V82" stroke={P.gold} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};

/** A 16x2 character LCD: a green board, a display window of two rows of cells, and mounting holes. */
export const lcd: DrawingSpec = {
  anchors: { display: [80, 46], 'mount-hole': [26, 22], 'top-row': [80, 40] },
  render: () => {
    const cell = (r: number, c: number) => (
      <rect key={`${r}-${c}`} x={32 + c * 6.4} y={r === 0 ? 34 : 50} width="5" height="9" rx=".8" fill="#0B3D3F" opacity=".75" />
    );
    return (
      <>
        <rect x="14" y="12" width="132" height="76" rx="4" fill={P.pcbGreen} stroke={P.pcbGreenEdge} strokeWidth="2" />
        {[
          [22, 20],
          [138, 20],
          [22, 80],
          [138, 80],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#0D3A22" stroke={P.gold} strokeWidth="1.2" />
        ))}
        <rect x="26" y="26" width="108" height="36" rx="2" fill="#7FC7BE" stroke="#2C5A55" strokeWidth="2" />
        {[0, 1].flatMap((r) => Array.from({ length: 16 }, (_, c) => cell(r, c)))}
      </>
    );
  },
};
