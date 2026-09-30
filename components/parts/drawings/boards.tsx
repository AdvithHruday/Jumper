import { P } from './palette';
import type { DrawingSpec } from './types';

/** Evenly spaced tiny pins along a header. */
function pinRow(x0: number, x1: number, y: number, step: number, fill: string = P.gold) {
  const out = [];
  for (let x = x0; x <= x1; x += step) out.push(<rect key={`${x}-${y}`} x={x} y={y} width="2.4" height="3" fill={fill} />);
  return out;
}

/** An Arduino Uno seen from above, drawn from its layout: USB and power jack at one end, the chip, and two header rows. */
export const uno: DrawingSpec = {
  anchors: { usb: [18, 35], chip: [94, 47], 'digital-pins': [104, 17], 'power-pins': [72, 83], 'analog-pins': [126, 83] },
  render: () => (
    <>
      <rect x="18" y="14" width="128" height="72" rx="5" fill={P.pcbTeal} stroke={P.pcbTealEdge} strokeWidth="2" />
      <rect x="6" y="24" width="26" height="22" rx="2" fill={P.silver} stroke={P.silverEdge} />
      <rect x="10" y="28" width="14" height="14" fill={P.silverDark} />
      <rect x="6" y="58" width="22" height="22" rx="3" fill="#1C1C1C" />
      <circle cx="17" cy="69" r="5" fill="#333" />
      <circle cx="44" cy="24" r="5" fill="#B7372F" stroke="#8E2A24" />
      <rect x="70" y="41" width="50" height="12" rx="1.5" fill={P.plastic} />
      <rect x="70" y="14" width="72" height="6" fill="#1A1A1A" />
      {pinRow(73, 137, 16, 5, '#C5C5C5')}
      <rect x="62" y="80" width="34" height="6" fill="#1A1A1A" />
      <rect x="104" y="80" width="38" height="6" fill="#1A1A1A" />
      {pinRow(65, 91, 82, 5, '#C5C5C5')}
      {pinRow(107, 137, 82, 5, '#C5C5C5')}
      <text x="40" y="62" fontSize="11" fontWeight="800" fill="#fff" opacity=".9" fontFamily="var(--font-head)">
        UNO
      </text>
    </>
  ),
};

/** An Arduino Nano: a narrow board with a mini-USB socket that plugs into a breadboard. */
export const nano: DrawingSpec = {
  anchors: { usb: [14, 50], chip: [79, 50], pins: [80, 35] },
  render: () => (
    <>
      <rect x="16" y="32" width="128" height="36" rx="3" fill={P.pcbBlue} stroke={P.pcbBlueEdge} strokeWidth="2" />
      <rect x="6" y="42" width="20" height="16" rx="2" fill={P.silver} stroke={P.silverEdge} />
      <rect x="66" y="42" width="24" height="16" rx="1.5" fill={P.plastic} />
      <rect x="98" y="43" width="14" height="14" rx="1.5" fill={P.plasticGrey} />
      {pinRow(30, 136, 34, 6)}
      {pinRow(30, 136, 63, 6)}
      <text x="36" y="53" fontSize="8" fontWeight="800" fill="#fff" opacity=".85" fontFamily="var(--font-head)">
        NANO
      </text>
    </>
  ),
};

/** An ESP32 DevKit V1: a shielded module with an antenna, a micro-USB socket, BOOT and EN buttons, and pins down both edges. */
export const esp32: DrawingSpec = {
  anchors: { module: [80, 28], usb: [80, 90], 'boot-button': [62, 82], 'en-button': [98, 82], antenna: [80, 12] },
  render: () => (
    <>
      <rect x="52" y="4" width="56" height="92" rx="4" fill={P.pcbBlack} stroke={P.pcbBlackEdge} strokeWidth="2" />
      <rect x="58" y="16" width="44" height="34" rx="2" fill={P.silver} stroke={P.silverEdge} />
      <path d="M60 14 h8 v-6 h8 v6 h8 v-6 h8 v6 h8" fill="none" stroke={P.gold} strokeWidth="2" strokeLinejoin="round" />
      <rect x="68" y="88" width="24" height="8" rx="1.5" fill={P.silver} stroke={P.silverEdge} />
      <rect x="57" y="76" width="10" height="9" rx="1.5" fill={P.plasticGrey} stroke="#777" />
      <rect x="93" y="76" width="10" height="9" rx="1.5" fill={P.plasticGrey} stroke="#777" />
      {[54, 58, 62, 66, 70, 74].map((y) => (
        <g key={y}>
          <rect x="54" y={y} width="3" height="2.4" fill={P.gold} />
          <rect x="103" y={y} width="3" height="2.4" fill={P.gold} />
        </g>
      ))}
    </>
  ),
};

/** A solderless breadboard from above: two power rails on each side, a centre channel and rows of holes. */
export const breadboard: DrawingSpec = {
  anchors: { rail: [80, 20], 'centre-channel': [80, 50], column: [50, 34] },
  render: () => {
    const cols: number[] = [];
    for (let x = 24; x <= 136; x += 6) cols.push(x);
    const dots = (ys: number[]) => ys.flatMap((y) => cols.map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="#5C5A50" />));
    return (
      <>
        <rect x="12" y="8" width="136" height="84" rx="5" fill={P.white} stroke={P.whiteEdge} strokeWidth="2" />
        <line x1="20" y1="14" x2="140" y2="14" stroke="#D8413B" strokeWidth="1.6" />
        <line x1="20" y1="86" x2="140" y2="86" stroke="#3B6FD8" strokeWidth="1.6" />
        {dots([19, 24, 76, 81])}
        <rect x="16" y="45" width="128" height="10" fill="#E2DFD2" />
        {dots([31, 37, 63, 69])}
      </>
    );
  },
};

/** Jumper wires: coloured flexible wires with a metal pin and a plastic boot at each end. */
export const jumperWires: DrawingSpec = {
  anchors: { 'pin-end': [30, 90], wire: [60, 30] },
  render: () => {
    const wire = (d: string, color: string) => <path d={d} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />;
    const end = (x: number, boot: string) => (
      <g key={x}>
        <rect x={x - 2} y="82" width="4" height="12" fill={P.silver} />
        <rect x={x - 6} y="74" width="12" height="10" rx="2" fill={boot} />
      </g>
    );
    return (
      <>
        {wire('M30 76 C30 6, 92 6, 92 76', P.wireRed)}
        {wire('M56 76 C56 28, 122 28, 122 76', P.wireBlack)}
        {wire('M84 76 C84 -6, 142 -6, 142 76', P.wireYellow)}
        {end(30, '#9E2A25')}
        {end(92, '#9E2A25')}
        {end(56, '#000')}
        {end(122, '#000')}
        {end(84, '#B98420')}
        {end(142, '#B98420')}
      </>
    );
  },
};
