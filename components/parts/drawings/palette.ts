/**
 * Colours for the part drawings. The board and metal colours are taken from
 * the guided diagram's own Board renderer so a part drawn here looks like it
 * belongs next to that diagram. Drawings need literal colours (they stand for
 * real objects, and must look the same in light and dark), so these are the
 * only place such values live.
 */
export const P = {
  pcbTeal: '#137C83',
  pcbTealEdge: '#0B5C62',
  pcbGreen: '#1F7A4A',
  pcbGreenEdge: '#155636',
  pcbBlue: '#1F5FA8',
  pcbBlueEdge: '#164A86',
  pcbRed: '#B7372F',
  pcbRedEdge: '#8E2A24',
  pcbBlack: '#22262B',
  pcbBlackEdge: '#14171A',
  silver: '#C2C8CD',
  silverEdge: '#8C949A',
  silverDark: '#9AA2A8',
  lead: '#A7ADB3',
  gold: '#C9A227',
  plastic: '#1A1A1A',
  plasticEdge: '#050505',
  plasticGrey: '#3B3F44',
  white: '#F1EFE7',
  whiteEdge: '#C9C4B4',
  wireRed: '#D8413B',
  wireBlack: '#222222',
  wireYellow: '#F2B53A',
  wireBrown: '#6D4C2F',
  wireOrange: '#EF7C1A',
  yellowBody: '#F2C230',
  yellowBodyEdge: '#C99A12',
  servoBlue: '#2F6FB7',
  servoBlueEdge: '#1F4F87',
  resistorBody: '#E3C999',
  resistorEdge: '#B89B62',
  ldr: '#C98A3A',
  ldrEdge: '#8C5E1E',
  accent: '#F2B53A',
} as const;
