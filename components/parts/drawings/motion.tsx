import { P } from './palette';
import type { DrawingSpec } from './types';

/** An SG90 micro servo: a blue body with mounting tabs, a white horn on the output shaft, and a three-wire cable. */
export const servo: DrawingSpec = {
  anchors: { horn: [100, 24], body: [72, 54], cable: [14, 82] },
  render: () => (
    <>
      <path d="M40 62 C24 66 22 82 8 84" stroke={P.wireBrown} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 66 C26 72 24 86 10 89" stroke={P.wireRed} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 70 C28 78 26 90 12 94" stroke={P.wireOrange} strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="30" y="34" width="84" height="40" rx="3" fill={P.servoBlue} stroke={P.servoBlueEdge} strokeWidth="2" />
      <rect x="22" y="46" width="10" height="14" rx="2" fill={P.servoBlue} stroke={P.servoBlueEdge} strokeWidth="2" />
      <rect x="112" y="46" width="10" height="14" rx="2" fill={P.servoBlue} stroke={P.servoBlueEdge} strokeWidth="2" />
      <circle cx="26" cy="53" r="2" fill="#0E2A4A" />
      <circle cx="118" cy="53" r="2" fill="#0E2A4A" />
      <rect x="86" y="24" width="28" height="14" rx="3" fill={P.servoBlue} stroke={P.servoBlueEdge} strokeWidth="2" />
      <path d="M100 24 L100 10 L58 12 L58 18 L100 20" fill="#F1F1EE" stroke="#C6C6BE" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="100" cy="24" r="7" fill="#F1F1EE" stroke="#C6C6BE" strokeWidth="1.5" />
      <circle cx="100" cy="24" r="2.5" fill="#999" />
    </>
  ),
};

/** An L298N motor driver module: a red board with a large black heatsink and blue screw terminals. */
export const l298n: DrawingSpec = {
  anchors: { heatsink: [80, 40], 'motor-a': [26, 46], 'motor-b': [134, 46], 'power-terminal': [80, 87] },
  render: () => (
    <>
      <rect x="18" y="8" width="124" height="82" rx="4" fill={P.pcbRed} stroke={P.pcbRedEdge} strokeWidth="2" />
      <rect x="62" y="18" width="36" height="44" rx="2" fill="#1E2124" stroke="#0A0B0C" />
      {[24, 30, 36, 42, 48, 54].map((y) => (
        <line key={y} x1="64" y1={y} x2="96" y2={y} stroke="#3A3F44" strokeWidth="2" />
      ))}
      <rect x="18" y="34" width="14" height="26" rx="2" fill="#2E6FD6" stroke="#1E4FA0" />
      <circle cx="25" cy="42" r="3" fill={P.silver} />
      <circle cx="25" cy="52" r="3" fill={P.silver} />
      <rect x="128" y="34" width="14" height="26" rx="2" fill="#2E6FD6" stroke="#1E4FA0" />
      <circle cx="135" cy="42" r="3" fill={P.silver} />
      <circle cx="135" cy="52" r="3" fill={P.silver} />
      <rect x="54" y="76" width="52" height="14" rx="2" fill="#2E6FD6" stroke="#1E4FA0" />
      {[64, 80, 96].map((x) => (
        <circle key={x} cx={x} cy="83" r="3" fill={P.silver} />
      ))}
      <rect x="36" y="66" width="86" height="6" fill="#1A1A1A" />
    </>
  ),
};

/** A geared TT motor: a yellow gearbox with a small motor can and two wires. */
export const dcMotor: DrawingSpec = {
  anchors: { gearbox: [66, 48], motor: [116, 48], wires: [22, 84] },
  render: () => (
    <>
      <path d="M40 66 C30 72 24 82 14 86" stroke={P.wireRed} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M44 68 C34 76 30 88 20 92" stroke={P.wireBlack} strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="36" y="26" width="72" height="44" rx="6" fill={P.yellowBody} stroke={P.yellowBodyEdge} strokeWidth="2" />
      <circle cx="54" cy="40" r="5" fill={P.yellowBodyEdge} />
      <circle cx="54" cy="58" r="5" fill={P.yellowBodyEdge} />
      <circle cx="90" cy="48" r="9" fill={P.yellowBodyEdge} />
      <rect x="108" y="34" width="34" height="28" rx="9" fill={P.silver} stroke={P.silverEdge} strokeWidth="2" />
      <rect x="130" y="40" width="10" height="16" rx="3" fill={P.silverDark} />
    </>
  ),
};

/** A two-wheel robot chassis: a flat plate with rows of mounting holes and a cut-out for each motor. */
export const chassis: DrawingSpec = {
  anchors: { plate: [80, 46], 'motor-mount': [30, 46], holes: [80, 28] },
  render: () => {
    const holes: [number, number][] = [];
    for (let x = 54; x <= 106; x += 8) for (const y of [24, 68]) holes.push([x, y]);
    return (
      <>
        <rect x="8" y="30" width="20" height="40" rx="8" fill="#20242A" stroke="#0C0E10" strokeWidth="2" />
        <rect x="132" y="30" width="20" height="40" rx="8" fill="#20242A" stroke="#0C0E10" strokeWidth="2" />
        <path d="M22 12 H138 Q146 12 146 20 V80 Q146 88 138 88 H22 Q14 88 14 80 V20 Q14 12 22 12 Z" fill="#CFE0EA" stroke="#8FA8B7" strokeWidth="2" />
        <rect x="14" y="36" width="28" height="28" rx="3" fill="#2C5873" stroke="#8FA8B7" />
        <rect x="118" y="36" width="28" height="28" rx="3" fill="#2C5873" stroke="#8FA8B7" />
        {holes.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="#2C5873" />
        ))}
        {[50, 58, 66, 74, 82, 90, 98, 106].map((x) => (
          <circle key={`m${x}`} cx={x} cy="46" r="2.6" fill="#2C5873" />
        ))}
      </>
    );
  },
};

/** A four-cell AA battery holder with a red and a black wire. */
export const batteryPack: DrawingSpec = {
  anchors: { holder: [70, 50], 'red-wire': [148, 40], 'black-wire': [148, 60] },
  render: () => (
    <>
      <path d="M124 44 C136 44 138 40 152 40" stroke={P.wireRed} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M124 56 C136 56 138 60 152 60" stroke={P.wireBlack} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="18" y="22" width="106" height="56" rx="6" fill={P.plasticGrey} stroke="#25282C" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="26" y={28 + i * 12} width="90" height="9" rx="4.5" fill="#1E2124" stroke="#555A60" />
          <rect x="30" y={30 + i * 12} width="46" height="5" rx="2.5" fill="#C9A227" opacity=".85" />
        </g>
      ))}
    </>
  ),
};
