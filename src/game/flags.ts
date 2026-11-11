import { FLAG_CODES } from './flagCodes';

interface NationTheme {
  name: string;
  accent: string;
  shapes: string;
}

const W = 60;
const HGT = 40;

type Band = string | [string, number];

function bands(dir: 'h' | 'v', parts: Band[]): string {
  const total = parts.reduce((sum, part) => sum + (typeof part === 'string' ? 1 : part[1]), 0);
  let offset = 0;
  let out = '';
  for (const part of parts) {
    const color = typeof part === 'string' ? part : part[0];
    const weight = typeof part === 'string' ? 1 : part[1];
    const size = (weight / total) * (dir === 'h' ? HGT : W);
    out +=
      dir === 'h'
        ? `<rect y="${offset.toFixed(3)}" width="${W}" height="${size.toFixed(3)}" fill="${color}"/>`
        : `<rect x="${offset.toFixed(3)}" width="${size.toFixed(3)}" height="${HGT}" fill="${color}"/>`;
    offset += size;
  }
  return out;
}

const H = (parts: Band[]) => bands('h', parts);
const V = (parts: Band[]) => bands('v', parts);
const rect = (x: number, y: number, w: number, h: number, fill: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const dot = (cx: number, cy: number, r: number, fill: string) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
const ring = (cx: number, cy: number, r: number, color: string, width: number) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
const poly = (points: string, fill: string) => `<polygon points="${points}" fill="${fill}"/>`;
const shape = (d: string, fill: string) => `<path d="${d}" fill="${fill}"/>`;
const stroke = (d: string, color: string, width: number) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"/>`;

function star(cx: number, cy: number, r: number, fill: string, rotation = 0): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.382;
    const angle = ((i * 36 - 90 + rotation) * Math.PI) / 180;
    points.push(`${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`);
  }
  return `<polygon points="${points.join(' ')}" fill="${fill}"/>`;
}

function starAt(cx: number, cy: number, r: number, fill: string, tx: number, ty: number): string {
  const angle = (Math.atan2(ty - cy, tx - cx) * 180) / Math.PI;
  return star(cx, cy, r, fill, angle + 90);
}

function crescent(cx: number, cy: number, r: number, fill: string, rotation = 0): string {
  const d = r * 0.62;
  const r2 = r * 0.92;
  const x = (d * d + r * r - r2 * r2) / (2 * d);
  const y = Math.sqrt(Math.max(0, r * r - x * x));
  const rad = (rotation * Math.PI) / 180;
  const rotate = (px: number, py: number) =>
    `${(cx + px * Math.cos(rad) - py * Math.sin(rad)).toFixed(2)} ${(cy + px * Math.sin(rad) + py * Math.cos(rad)).toFixed(2)}`;
  const a = rotate(x, -y);
  const b = rotate(x, y);
  return `<path d="M${a} A${r} ${r} 0 1 0 ${b} A${r2} ${r2} 0 1 1 ${a} Z" fill="${fill}"/>`;
}

function sun(cx: number, cy: number, r: number, color: string, rays = 12, rayLength = 1.6): string {
  let out = '';
  for (let i = 0; i < rays; i++) {
    const angle = (i * Math.PI * 2) / rays;
    out += `M${(cx + Math.cos(angle) * r).toFixed(2)},${(cy + Math.sin(angle) * r).toFixed(2)} L${(cx + Math.cos(angle) * (r + rayLength)).toFixed(2)},${(cy + Math.sin(angle) * (r + rayLength)).toFixed(2)} `;
  }
  return `<path d="${out.trim()}" stroke="${color}" stroke-width="0.8"/>${dot(cx, cy, r, color)}`;
}

const JACK =
  '<rect width="60" height="40" fill="#012169"/>' +
  '<path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="9"/>' +
  '<path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="4.6"/>' +
  '<rect x="24" width="12" height="40" fill="#fff"/><rect y="14" width="60" height="12" fill="#fff"/>' +
  '<rect x="27" width="6" height="40" fill="#C8102E"/><rect y="17" width="60" height="6" fill="#C8102E"/>';
const JACK_CANTON = `<g transform="scale(0.5)">${JACK}</g>`;

const NATIONS: NationTheme[] = [
  {
    name: 'Afghanistan',
    accent: '#D32011',
    shapes: V(['#000000', '#D32011', '#007A36']) + dot(30, 20, 4.5, '#fff') + dot(30, 20, 3, '#D32011'),
  },
  {
    name: 'Albania',
    accent: '#E41E20',
    shapes:
      rect(0, 0, 60, 40, '#E41E20') +
      shape('M30 11 L34 16 L45 12 L40 20 L45 29 L34 25 L30 30 L26 25 L15 29 L20 20 L15 12 L26 16 Z', '#000000'),
  },
  {
    name: 'Algeria',
    accent: '#006233',
    shapes: V(['#006233', '#ffffff']) + crescent(30, 20, 8, '#D21034') + star(34, 20, 3.4, '#D21034', 90),
  },
  {
    name: 'Andorra',
    accent: '#10069F',
    shapes: V(['#10069F', '#FEDF00', '#D0103A']) + rect(18, 13, 7, 12, '#C7A76C') + rect(19.5, 15, 4, 4, '#D0103A'),
  },
  {
    name: 'Angola',
    accent: '#CC092F',
    shapes: H(['#CC092F', '#000000']) + ring(30, 21, 5, '#FFCB00', 1.3) + star(30, 17.5, 2.6, '#FFCB00'),
  },
  {
    name: 'Antigua and Barbuda',
    accent: '#CE1126',
    shapes:
      rect(0, 0, 60, 40, '#CE1126') +
      poly('0,0 26,20 0,40', '#000000') +
      poly('0,26 26,20 0,40', '#0072C6') +
      poly('0,14 26,20 0,26', '#ffffff') +
      sun(9, 20, 3.6, '#FCD116', 8, 1.2),
  },
  {
    name: 'Argentina',
    accent: '#74ACDF',
    shapes:
      H(['#74ACDF', '#ffffff', '#74ACDF']) + sun(30, 20, 3.2, '#F6B40E', 16, 1.2),
  },
  {
    name: 'Armenia',
    accent: '#D90012',
    shapes: H(['#D90012', '#0033A0', '#F2A800']),
  },
  {
    name: 'Australia',
    accent: '#00247D',
    shapes:
      rect(0, 0, 60, 40, '#00247D') +
      JACK_CANTON +
      star(30, 30, 4.2, '#ffffff') +
      star(46, 8, 2.2, '#ffffff') +
      star(52, 18, 2.2, '#ffffff') +
      star(44, 24, 2.2, '#ffffff') +
      star(52, 30, 1.6, '#ffffff'),
  },
  {
    name: 'Austria',
    accent: '#ED2939',
    shapes: H(['#ED2939', '#ffffff', '#ED2939']),
  },
  {
    name: 'Azerbaijan',
    accent: '#0092BC',
    shapes:
      H(['#0092BC', '#E4002B', '#00AF66']) +
      crescent(27, 20, 6.4, '#ffffff') +
      star(34.5, 20, 3, '#ffffff', 90),
  },
  {
    name: 'Bahamas',
    accent: '#00778B',
    shapes: H(['#00778B', '#FFC72C', '#00778B']) + poly('0,0 24,20 0,40', '#000000'),
  },
  {
    name: 'Bahrain',
    accent: '#CE1126',
    shapes:
      rect(0, 0, 60, 40, '#CE1126') +
      rect(0, 0, 22, 40, '#ffffff') +
      poly('22,0 30,5 22,10 30,15 22,20 30,25 22,30 30,35 22,40', '#ffffff'),
  },
  {
    name: 'Bangladesh',
    accent: '#006A4E',
    shapes: rect(0, 0, 60, 40, '#006A4E') + dot(26, 20, 7.5, '#F42A41'),
  },
  {
    name: 'Barbados',
    accent: '#00267F',
    shapes:
      V(['#00267F', '#FFC726', '#00267F']) +
      rect(29, 11, 2, 18, '#000000') +
      shape('M30 11 L30 15 M24 9 L26 16 M36 9 L34 16', 'none') +
      stroke('M22 9 L25 16 M38 9 L35 16', '#000000', 1.8),
  },
  {
    name: 'Belarus',
    accent: '#C8313E',
    shapes:
      H([['#C8313E', 2], ['#4AA657', 1]]) +
      rect(0, 0, 7, 40, '#ffffff') +
      poly('2,3 5,6 2,9', '#C8313E') +
      poly('2,15 5,18 2,21', '#C8313E') +
      poly('2,27 5,30 2,33', '#C8313E'),
  },
  {
    name: 'Belgium',
    accent: '#FDDA24',
    shapes: V(['#000000', '#FDDA24', '#EF3340']),
  },
  {
    name: 'Belize',
    accent: '#003F87',
    shapes:
      rect(0, 0, 60, 40, '#003F87') +
      rect(0, 0, 60, 5, '#CE1126') +
      rect(0, 35, 60, 5, '#CE1126') +
      dot(30, 20, 8, '#ffffff') +
      ring(30, 20, 5.5, '#289400', 1.2) +
      dot(30, 20, 2.6, '#9B7B3E'),
  },
  {
    name: 'Benin',
    accent: '#008751',
    shapes: rect(0, 0, 60, 40, '#FCD116') + rect(0, 20, 60, 20, '#E8112D') + rect(0, 0, 22, 40, '#008751'),
  },
  {
    name: 'Bhutan',
    accent: '#FF4E12',
    shapes:
      rect(0, 0, 60, 40, '#FFD520') +
      poly('0,0 60,0 60,40', '#FF4E12') +
      shape('M22 26 C26 20 34 22 36 18 C38 14 32 13 30 16', '#ffffff') +
      dot(36, 17, 1.6, '#ffffff'),
  },
  {
    name: 'Bolivia',
    accent: '#D52B1E',
    shapes: H(['#D52B1E', '#F9E300', '#007934']) + dot(30, 20, 4, '#B22234') + dot(30, 20, 2.4, '#7B4B1F'),
  },
  {
    name: 'Bosnia and Herzegovina',
    accent: '#002F6C',
    shapes:
      rect(0, 0, 60, 40, '#002F6C') +
      poly('16,0 44,0 44,40', '#FECB00') +
      star(20, 6, 2.6, '#ffffff') +
      star(25, 13, 2.6, '#ffffff') +
      star(30, 20, 2.6, '#ffffff') +
      star(35, 27, 2.6, '#ffffff') +
      star(40, 34, 2.6, '#ffffff'),
  },
  {
    name: 'Botswana',
    accent: '#00A1DE',
    shapes:
      rect(0, 0, 60, 40, '#00A1DE') +
      rect(0, 14, 60, 12, '#ffffff') +
      rect(0, 16.5, 60, 7, '#000000'),
  },
  {
    name: 'Brazil',
    accent: '#009C3B',
    shapes:
      rect(0, 0, 60, 40, '#009C3B') +
      poly('30,4 56,20 30,36 4,20', '#FFDF00') +
      dot(30, 20, 6.4, '#002776') +
      stroke('M24.4 21.4 Q30 17.6 35.6 19.2', '#ffffff', 1.3),
  },
  {
    name: 'Brunei',
    accent: '#F7E017',
    shapes:
      rect(0, 0, 60, 40, '#F7E017') +
      poly('0,0 60,0 60,9 0,24', '#000000') +
      poly('0,4 60,0 60,5 0,20', '#ffffff') +
      poly('0,16 60,8 60,14 0,26', '#ffffff') +
      rect(20, 12, 20, 8, '#CF1126') +
      crescent(26, 16, 4, '#F7E017'),
  },
  {
    name: 'Bulgaria',
    accent: '#D62612',
    shapes: H(['#ffffff', '#00966E', '#D62612']),
  },
  {
    name: 'Burkina Faso',
    accent: '#EF2B2D',
    shapes: H(['#EF2B2D', '#009E49']) + star(30, 20, 6, '#FCD116'),
  },
  {
    name: 'Burundi',
    accent: '#CE1126',
    shapes:
      rect(0, 0, 60, 40, '#CE1126') +
      poly('0,0 60,40 0,40', '#1EB53A') +
      poly('60,0 0,0 60,40', '#CE1126') +
      stroke('M0,0 L60,40 M60,0 L0,40', '#ffffff', 6) +
      dot(30, 20, 8.5, '#ffffff') +
      star(30, 15, 2.4, '#CE1126') +
      star(26.5, 24, 2.4, '#CE1126') +
      star(33.5, 24, 2.4, '#CE1126'),
  },
  {
    name: 'Cabo Verde',
    accent: '#003893',
    shapes:
      rect(0, 0, 60, 40, '#003893') +
      rect(0, 22, 60, 1.6, '#ffffff') +
      rect(0, 24, 60, 2, '#CF2027') +
      rect(0, 26.4, 60, 1.6, '#ffffff') +
      star(26, 25, 1.6, '#F7D116') +
      star(31, 22, 1.6, '#F7D116') +
      star(36, 25, 1.6, '#F7D116') +
      star(28, 29, 1.6, '#F7D116') +
      star(34, 29, 1.6, '#F7D116'),
  },
  {
    name: 'Cambodia',
    accent: '#032EA1',
    shapes:
      H([['#032EA1', 1], ['#E00025', 2], ['#032EA1', 1]]) +
      rect(26, 17, 8, 7, '#ffffff') +
      rect(24, 24, 12, 1.6, '#ffffff'),
  },
  {
    name: 'Cameroon',
    accent: '#007A5E',
    shapes: V(['#007A5E', '#CE1126', '#FCD116']) + star(30, 20, 4.4, '#FCD116'),
  },
  {
    name: 'Canada',
    accent: '#FF0000',
    shapes:
      rect(0, 0, 60, 40, '#ffffff') +
      rect(0, 0, 15, 40, '#FF0000') +
      rect(45, 0, 15, 40, '#FF0000') +
      shape('M30 8.5 L32.2 13.2 L35.5 12 L34.6 15.4 L40 14.2 L37.4 18 L42.5 19.6 L36.2 21.8 L37.6 24.4 L31.6 23.6 L31.6 30 L28.4 30 L28.4 23.6 L22.4 24.4 L23.8 21.8 L17.5 19.6 L22.6 18 L20 14.2 L25.4 15.4 L24.5 12 L27.8 13.2 Z', '#FF0000'),
  },
  {
    name: 'Central African Republic',
    accent: '#003082',
    shapes:
      H(['#003082', '#ffffff', '#289728', '#FFCE00']) +
      rect(22, 0, 8, 40, '#D21034') +
      star(14, 8, 3.4, '#FFCE00'),
  },
  {
    name: 'Chad',
    accent: '#002664',
    shapes: V(['#002664', '#FFCE00', '#C60C30']),
  },
  {
    name: 'Chile',
    accent: '#D52B1E',
    shapes:
      rect(0, 0, 60, 20, '#ffffff') +
      rect(0, 20, 60, 20, '#D52B1E') +
      rect(0, 0, 20, 20, '#0039A6') +
      star(10, 10, 4.6, '#ffffff'),
  },
  {
    name: 'China',
    accent: '#DE2910',
    shapes:
      rect(0, 0, 60, 40, '#DE2910') +
      star(10, 10, 6.2, '#FFDE00') +
      starAt(20, 4, 2.1, '#FFDE00', 10, 10) +
      starAt(24, 8, 2.1, '#FFDE00', 10, 10) +
      starAt(24, 13.5, 2.1, '#FFDE00', 10, 10) +
      starAt(20, 17.5, 2.1, '#FFDE00', 10, 10),
  },
  {
    name: 'Colombia',
    accent: '#FCD116',
    shapes: H([['#FCD116', 2], ['#003893', 1], ['#CE1126', 1]]),
  },
  {
    name: 'Comoros',
    accent: '#3A75C4',
    shapes:
      H(['#FFC61E', '#ffffff', '#CE1126', '#3A75C4']) +
      poly('0,0 26,20 0,40', '#3D8E33') +
      crescent(11, 20, 6.4, '#ffffff') +
      star(16.5, 20, 2.2, '#ffffff', 90),
  },
  {
    name: 'Congo',
    accent: '#009543',
    shapes:
      rect(0, 0, 60, 40, '#009543') +
      poly('0,40 60,0 60,40', '#FBDE4A') +
      poly('4,40 60,4 60,40', '#DC241F'),
  },
  {
    name: 'Costa Rica',
    accent: '#002B7F',
    shapes: H([['#002B7F', 1], ['#ffffff', 1], ['#CE1126', 2], ['#ffffff', 1], ['#002B7F', 1]]),
  },
  {
    name: "Côte d'Ivoire",
    accent: '#F77F00',
    shapes: V(['#F77F00', '#ffffff', '#009E60']),
  },
  {
    name: 'Croatia',
    accent: '#171796',
    shapes:
      H(['#FF0000', '#ffffff', '#171796']) +
      rect(24, 13, 12, 14, '#ffffff') +
      rect(24, 13, 3, 3.5, '#FF0000') +
      rect(30, 13, 3, 3.5, '#FF0000') +
      rect(36, 13, 3, 3.5, '#FF0000') +
      rect(27, 16.5, 3, 3.5, '#FF0000') +
      rect(33, 16.5, 3, 3.5, '#FF0000') +
      rect(24, 20, 3, 3.5, '#FF0000') +
      rect(30, 20, 3, 3.5, '#FF0000') +
      rect(36, 20, 3, 3.5, '#FF0000') +
      rect(27, 23.5, 3, 3.5, '#FF0000') +
      rect(33, 23.5, 3, 3.5, '#FF0000'),
  },
  {
    name: 'Cuba',
    accent: '#002A8F',
    shapes:
      H(['#002A8F', '#ffffff', '#002A8F', '#ffffff', '#002A8F']) +
      poly('0,0 26,20 0,40', '#CF142B') +
      star(9, 20, 5, '#ffffff'),
  },
  {
    name: 'Cyprus',
    accent: '#4E5B31',
    shapes:
      rect(0, 0, 60, 40, '#ffffff') +
      shape('M22 16 C26 12 34 12 38 16 C42 20 38 26 32 25 C26 24 20 21 22 16 Z', '#D57800') +
      stroke('M20 30 C26 34 34 34 40 30', '#4E5B31', 1.4) +
      stroke('M20 33 C26 37 34 37 40 33', '#4E5B31', 1.4),
  },
  {
    name: 'Czechia',
    accent: '#11457E',
    shapes:
      rect(0, 0, 60, 20, '#ffffff') +
      rect(0, 20, 60, 20, '#D7141A') +
      poly('0,0 25,20 0,40', '#11457E'),
  },
  {
    name: 'Democratic Republic of the Congo',
    accent: '#007FFF',
    shapes:
      rect(0, 0, 60, 40, '#007FFF') +
      poly('0,36 52,0 58,0 6,36', '#F7D618') +
      poly('6,40 60,4 60,9 12,40', '#CE1021') +
      star(11, 9, 4.6, '#F7D618'),
  },
  {
    name: 'Denmark',
    accent: '#C8102E',
    shapes:
      rect(0, 0, 60, 40, '#C8102E') +
      rect(18, 0, 8, 40, '#ffffff') +
      rect(0, 16, 60, 8, '#ffffff'),
  },
  {
    name: 'Djibouti',
    accent: '#6AB2E7',
    shapes:
      H(['#6AB2E7', '#12AD2B']) +
      poly('0,0 30,20 0,40', '#ffffff') +
      star(12, 20, 4, '#D7141A'),
  },
  {
    name: 'Dominica',
    accent: '#006B3F',
    shapes:
      rect(0, 0, 60, 40, '#006B3F') +
      stroke('M0,0 L60,40 M60,0 L0,40', '#ffffff', 4) +
      stroke('M0,0 L60,40 M60,0 L0,40', '#FCD116', 1.8) +
      rect(24, 0, 12, 40, '#FCD116') +
      rect(0, 14, 60, 12, '#FCD116') +
      dot(30, 20, 8, '#D41C30') +
      shape('M26 20 C28 16 32 16 34 20 C32 24 28 24 26 20 Z', '#006B3F'),
  },
  {
    name: 'Dominican Republic',
    accent: '#002D62',
    shapes:
      rect(0, 0, 30, 20, '#002D62') +
      rect(30, 20, 30, 20, '#002D62') +
      rect(30, 0, 30, 20, '#CE1126') +
      rect(0, 20, 30, 20, '#CE1126') +
      rect(26, 0, 8, 40, '#ffffff') +
      rect(0, 16, 60, 8, '#ffffff') +
      dot(30, 20, 3, '#006300'),
  },
  {
    name: 'Ecuador',
    accent: '#FFDD00',
    shapes:
      H([['#FFDD00', 2], ['#034EA2', 1], ['#ED1C24', 1]]) +
      ring(30, 20, 4.6, '#8C7B5E', 1.6) +
      shape('M30 15 L33 20 L30 25 L27 20 Z', '#6D8CA8'),
  },
  {
    name: 'Egypt',
    accent: '#CE1126',
    shapes: H(['#CE1126', '#ffffff', '#000000']) + dot(30, 21, 3, '#C09300'),
  },
  {
    name: 'El Salvador',
    accent: '#0F47AF',
    shapes: H(['#0F47AF', '#ffffff', '#0F47AF']) + ring(30, 20, 4.2, '#0F47AF', 1.2) + dot(30, 20, 1.8, '#0F47AF'),
  },
  {
    name: 'Equatorial Guinea',
    accent: '#3E9A00',
    shapes:
      H(['#3E9A00', '#ffffff', '#E32118']) +
      poly('0,0 20,20 0,40', '#0073CE') +
      rect(24, 14, 12, 12, '#ffffff') +
      shape('M26 20 L30 16 L34 20 L30 24 Z', '#7A5230'),
  },
  {
    name: 'Eritrea',
    accent: '#12AD2B',
    shapes:
      poly('0,0 60,0 60,20 0,20', '#12AD2B') +
      poly('0,20 60,20 60,40 0,40', '#4189DD') +
      poly('0,0 34,20 0,40', '#EA0437') +
      stroke('M8 20 C14 16 20 16 26 20', '#FFC726', 1.8),
  },
  {
    name: 'Estonia',
    accent: '#0072CE',
    shapes: H(['#0072CE', '#000000', '#ffffff']),
  },
  {
    name: 'Eswatini',
    accent: '#3E5EB9',
    shapes:
      H(['#3E5EB9', '#FFD900', '#B10C0C']) +
      shape('M30 11 C22 14 22 26 30 29 C38 26 38 14 30 11 Z', '#000000') +
      rect(29, 11, 2, 18, '#ffffff') +
      dot(30, 20, 2, '#B10C0C'),
  },
  {
    name: 'Ethiopia',
    accent: '#078930',
    shapes: H(['#078930', '#FCDD09', '#DA121A']) + dot(30, 20, 8, '#0F47AF') + star(30, 20, 4.4, '#FCDD09'),
  },
  {
    name: 'Fiji',
    accent: '#68BFE5',
    shapes:
      rect(0, 0, 60, 40, '#68BFE5') +
      JACK_CANTON +
      rect(38, 12, 14, 16, '#ffffff') +
      rect(39.5, 13.5, 11, 5, '#CE1126') +
      dot(45, 22, 3, '#7A5230'),
  },
  {
    name: 'Finland',
    accent: '#003580',
    shapes:
      rect(0, 0, 60, 40, '#ffffff') +
      rect(17, 0, 8, 40, '#003580') +
      rect(0, 16, 60, 8, '#003580'),
  },
  {
    name: 'France',
    accent: '#0055A4',
    shapes: V(['#0055A4', '#ffffff', '#EF4135']),
  },
  {
    name: 'Gabon',
    accent: '#009E60',
    shapes: H(['#009E60', '#FCD116', '#3A75C4']),
  },
  {
    name: 'Gambia',
    accent: '#0C1C8C',
    shapes: H([['#CE1126', 3], ['#ffffff', 1], ['#0C1C8C', 3], ['#ffffff', 1], ['#3A7728', 3]]),
  },
  {
    name: 'Georgia',
    accent: '#FF0000',
    shapes:
      rect(0, 0, 60, 40, '#ffffff') +
      rect(26, 0, 8, 40, '#FF0000') +
      rect(0, 16, 60, 8, '#FF0000') +
      rect(7, 5, 4, 4, '#FF0000') +
      rect(49, 5, 4, 4, '#FF0000') +
      rect(7, 31, 4, 4, '#FF0000') +
      rect(49, 31, 4, 4, '#FF0000'),
  },
  {
    name: 'Germany',
    accent: '#DD0000',
    shapes: H(['#000000', '#DD0000', '#FFCE00']),
  },
  {
    name: 'Ghana',
    accent: '#006B3F',
    shapes: H(['#CE1126', '#FCD116', '#006B3F']) + star(30, 20, 6, '#000000'),
  },
  {
    name: 'Greece',
    accent: '#0D5EAF',
    shapes:
      rect(0, 0, 60, 40, '#ffffff') +
      rect(0, 0, 60, 4.444, '#0D5EAF') +
      rect(0, 8.889, 60, 4.444, '#0D5EAF') +
      rect(0, 17.778, 60, 4.444, '#0D5EAF') +
      rect(0, 26.667, 60, 4.444, '#0D5EAF') +
      rect(0, 35.556, 60, 4.444, '#0D5EAF') +
      rect(0, 0, 22.2, 22.2, '#0D5EAF') +
      rect(8.9, 0, 4.4, 22.2, '#ffffff') +
      rect(0, 8.9, 22.2, 4.4, '#ffffff'),
  },
  {
    name: 'Grenada',
    accent: '#CE1126',
    shapes:
      rect(0, 0, 60, 40, '#CE1126') +
      rect(6, 4, 24, 14, '#007A5E') +
      rect(30, 4, 24, 14, '#FCD116') +
      rect(6, 18, 24, 14, '#FCD116') +
      rect(30, 18, 24, 14, '#007A5E') +
      dot(30, 20, 6, '#CE1126') +
      star(30, 18, 2.4, '#FCD116') +
      dot(8, 6, 1.4, '#FCD116') +
      dot(52, 6, 1.4, '#FCD116') +
      dot(8, 34, 1.4, '#FCD116') +
      dot(52, 34, 1.4, '#FCD116'),
  },
  {
    name: 'Guatemala',
    accent: '#4997D0',
    shapes: V(['#4997D0', '#ffffff', '#4997D0']) + ring(30, 20, 4.6, '#4997D0', 1.2) + dot(30, 20, 2.2, '#6B8E23'),
  },
  {
    name: 'Guinea',
    accent: '#CE1126',
    shapes: V(['#CE1126', '#FCD116', '#009460']),
  },
  {
    name: 'Guinea-Bissau',
    accent: '#009E49',
    shapes:
      rect(0, 0, 60, 20, '#FCD116') +
      rect(0, 20, 60, 20, '#009E49') +
      rect(0, 0, 22, 40, '#CE1126') +
      star(11, 20, 5.4, '#000000'),
  },
  {
    name: 'Guyana',
    accent: '#009E49',
    shapes:
      rect(0, 0, 60, 40, '#009E49') +
      poly('0,0 46,20 0,40', '#FFD100') +
      poly('0,6 34,20 0,34', '#CE1126') +
      poly('0,12 22,20 0,28', '#000000'),
  },
  {
    name: 'Haiti',
    accent: '#00209F',
    shapes:
      H(['#00209F', '#D21034']) +
      rect(22, 14, 16, 12, '#ffffff') +
      shape('M26 20 L30 16 L34 20 L30 24 Z', '#009639'),
  },
  {
    name: 'Honduras',
    accent: '#0073CF',
    shapes:
      H(['#0073CF', '#ffffff', '#0073CF']) +
      star(24, 20, 2.4, '#0073CF') +
      star(30, 20, 2.4, '#0073CF') +
      star(36, 20, 2.4, '#0073CF') +
      star(27, 16, 2.4, '#0073CF') +
      star(33, 24, 2.4, '#0073CF'),
  },
  {
    name: 'Hungary',
    accent: '#CE2939',
    shapes: H(['#CE2939', '#ffffff', '#477050']),
  },
  {
    name: 'Iceland',
    accent: '#02529C',
    shapes:
      rect(0, 0, 60, 40, '#02529C') +
      rect(15, 0, 12, 40, '#ffffff') +
      rect(0, 14, 60, 12, '#ffffff') +
      rect(17.5, 0, 7, 40, '#DC1E35') +
      rect(0, 16.5, 60, 7, '#DC1E35'),
  },
  {
    name: 'India',
    accent: '#FF9933',
    shapes:
      H(['#FF9933', '#ffffff', '#138808']) +
      ring(30, 20, 4.9, '#000080', 0.9) +
      dot(30, 20, 1.1, '#000080') +
      stroke(
        Array.from({ length: 24 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 24;
          return `M30,20 L${(30 + Math.cos(angle) * 4.9).toFixed(2)},${(20 + Math.sin(angle) * 4.9).toFixed(2)}`;
        }).join(' '),
        '#000080',
        0.35,
      ),
  },
  {
    name: 'Indonesia',
    accent: '#CE1126',
    shapes: H(['#CE1126', '#ffffff']),
  },
  {
    name: 'Iran',
    accent: '#239F40',
    shapes:
      H(['#239F40', '#ffffff', '#DA0000']) +
      shape('M30 14 L32 20 L30 26 L28 20 Z', '#DA0000') +
      rect(24, 15, 12, 1.2, '#DA0000') +
      rect(24, 24, 12, 1.2, '#DA0000'),
  },
  {
    name: 'Iraq',
    accent: '#CE1126',
    shapes: H(['#CE1126', '#ffffff', '#000000']) + rect(22, 18, 16, 4, '#007A3D'),
  },
  {
    name: 'Ireland',
    accent: '#169B62',
    shapes: V(['#169B62', '#ffffff', '#FF883E']),
  },
  {
    name: 'Israel',
    accent: '#0038B8',
    shapes:
      rect(0, 0, 60, 40, '#ffffff') +
      rect(0, 4, 60, 4, '#0038B8') +
      rect(0, 32, 60, 4, '#0038B8') +
      stroke('M30 12.5 L37.4 25 L22.6 25 Z M30 27.5 L22.6 15 L37.4 15 Z', '#0038B8', 1.7),
  },
  {
    name: 'Italy',
    accent: '#009246',
    shapes: V(['#009246', '#ffffff', '#CE2B37']),
  },
  {
    name: 'Jamaica',
    accent: '#009B3A',
    shapes:
      rect(0, 0, 60, 40, '#009B3A') +
      poly('0,0 30,20 0,40', '#000000') +
      poly('60,0 30,20 60,40', '#000000') +
      stroke('M0,0 L60,40 M60,0 L0,40', '#FED100', 5),
  },
  {
    name: 'Japan',
    accent: '#BC002D',
    shapes: rect(0, 0, 60, 40, '#ffffff') + dot(30, 20, 12, '#BC002D'),
  },
  {
    name: 'Jordan',
    accent: '#007A3D',
    shapes:
      H(['#000000', '#ffffff', '#007A3D']) +
      poly('0,0 26,20 0,40', '#CE1126') +
      star(8.5, 20, 3.2, '#ffffff'),
  },
  {
    name: 'Kazakhstan',
    accent: '#00AFCA',
    shapes:
      rect(0, 0, 60, 40, '#00AFCA') +
      sun(30, 17, 4.4, '#FEC50C', 20, 1.4) +
      shape('M20 27 C24 24 36 24 40 27 C36 30 24 30 20 27 Z', '#FEC50C'),
  },
  {
    name: 'Kenya',
    accent: '#006600',
    shapes:
      H([['#000000', 1], ['#ffffff', 0.3], ['#BB0000', 1], ['#ffffff', 0.3], ['#006600', 1]]) +
      shape('M27 8 C23 14 23 26 27 32 C31 26 31 14 27 8 Z', '#BB0000') +
      shape('M33 8 C29 14 29 26 33 32 C37 26 37 14 33 8 Z', '#000000') +
      rect(28.5, 8, 3, 24, '#ffffff'),
  },
  {
    name: 'Kiribati',
    accent: '#CE1126',
    shapes:
      rect(0, 0, 60, 40, '#CE1126') +
      rect(0, 26, 60, 2.5, '#ffffff') +
      rect(0, 30, 60, 2.5, '#003F87') +
      rect(0, 34, 60, 2.5, '#ffffff') +
      rect(0, 38, 60, 2, '#003F87') +
      sun(30, 22, 4.2, '#FCD116', 12, 1.2) +
      shape('M24 12 C30 8 38 10 40 6 C38 12 32 14 24 12 Z', '#FCD116'),
  },
  {
    name: 'Kuwait',
    accent: '#007A3D',
    shapes:
      H(['#007A3D', '#ffffff', '#CE1126']) +
      poly('0,0 18,10 18,30 0,40', '#000000'),
  },
  {
    name: 'Kyrgyzstan',
    accent: '#D5182F',
    shapes: rect(0, 0, 60, 40, '#D5182F') + sun(30, 20, 5.4, '#FFEF00', 40, 1.4) + ring(30, 20, 3, '#D5182F', 1.2),
  },
  {
    name: 'Laos',
    accent: '#CE1126',
    shapes: H([['#CE1126', 1], ['#002868', 2], ['#CE1126', 1]]) + dot(30, 20, 8, '#ffffff'),
  },
  {
    name: 'Latvia',
    accent: '#9E3039',
    shapes: H([['#9E3039', 2], ['#ffffff', 1], ['#9E3039', 2]]),
  },
  {
    name: 'Lebanon',
    accent: '#ED1C24',
    shapes:
      H([['#ED1C24', 1], ['#ffffff', 2], ['#ED1C24', 1]]) +
      shape('M30 9 L33 16 L36 14 L34 22 L26 22 L24 14 L27 16 Z', '#007A3D'),
  },
  {
    name: 'Lesotho',
    accent: '#00209F',
    shapes:
      H(['#00209F', '#ffffff', '#009543']) +
      shape('M24 22 L36 22 L30 15 Z', '#000000') +
      rect(24, 22, 12, 1.6, '#000000'),
  },
  {
    name: 'Liberia',
    accent: '#002868',
    shapes:
      H(['#BF0A30', '#ffffff', '#BF0A30', '#ffffff', '#BF0A30', '#ffffff', '#BF0A30', '#ffffff', '#BF0A30', '#ffffff', '#BF0A30']) +
      rect(0, 0, 22, 18, '#002868') +
      star(11, 9, 4.6, '#ffffff'),
  },
  {
    name: 'Libya',
    accent: '#239E46',
    shapes: H(['#E70013', '#000000', '#239E46']) + crescent(30, 20, 6, '#ffffff') + star(35, 20, 2.8, '#ffffff', 90),
  },
  {
    name: 'Liechtenstein',
    accent: '#002B7F',
    shapes: H(['#002B7F', '#CE1126']) + shape('M24 6 L36 6 L34 10 L26 10 Z', '#FFD83D') + rect(28, 10, 4, 3, '#FFD83D'),
  },
  {
    name: 'Lithuania',
    accent: '#FDB913',
    shapes: H(['#FDB913', '#006A44', '#C1272D']),
  },
  {
    name: 'Luxembourg',
    accent: '#00A1DE',
    shapes: H(['#ED2939', '#ffffff', '#00A1DE']),
  },
  {
    name: 'Madagascar',
    accent: '#FC3D32',
    shapes: rect(0, 0, 60, 20, '#FC3D32') + rect(0, 20, 60, 20, '#007E3A') + rect(0, 0, 20, 40, '#ffffff'),
  },
  {
    name: 'Malawi',
    accent: '#CE1126',
    shapes: H(['#000000', '#CE1126', '#339E35']) + shape('M22 14 A8 8 0 0 1 38 14 Z', '#CE1126'),
  },
  {
    name: 'Malaysia',
    accent: '#CC0001',
    shapes:
      H(['#CC0001', '#ffffff', '#CC0001', '#ffffff', '#CC0001', '#ffffff', '#CC0001']) +
      rect(0, 0, 30, 20, '#010066') +
      crescent(12, 10, 6.4, '#FFCC00') +
      star(20, 10, 3.4, '#FFCC00', 90),
  },
  {
    name: 'Maldives',
    accent: '#D21034',
    shapes: rect(0, 0, 60, 40, '#D21034') + rect(15, 11, 26, 18, '#007E3A') + crescent(30, 20, 6, '#ffffff'),
  },
  {
    name: 'Mali',
    accent: '#14B53A',
    shapes: V(['#14B53A', '#FCD116', '#CE1126']),
  },
  {
    name: 'Malta',
    accent: '#CF142B',
    shapes: V(['#ffffff', '#CF142B']) + rect(4, 4, 7, 7, '#9E9E9E') + rect(6.5, 4, 2, 7, '#ffffff') + rect(4, 6.5, 7, 2, '#ffffff'),
  },
  {
    name: 'Marshall Islands',
    accent: '#003893',
    shapes:
      rect(0, 0, 60, 40, '#003893') +
      poly('0,40 60,0 60,5 4,40', '#ffffff') +
      poly('0,40 60,0 60,3 1,40', '#DD7500') +
      star(12, 9, 4.4, '#ffffff'),
  },
  {
    name: 'Mauritania',
    accent: '#00A95C',
    shapes:
      rect(0, 0, 60, 40, '#00A95C') +
      rect(0, 0, 60, 4, '#D01C1F') +
      rect(0, 36, 60, 4, '#D01C1F') +
      crescent(30, 21, 7, '#FFD700') +
      star(30, 14, 3.6, '#FFD700'),
  },
  {
    name: 'Mauritius',
    accent: '#EA2839',
    shapes: H(['#EA2839', '#1A206D', '#FFD500', '#00A551']),
  },
  {
    name: 'Mexico',
    accent: '#006847',
    shapes:
      V(['#006847', '#ffffff', '#CE1126']) +
      shape('M28 15 C32 14 34 17 33 20 C32 23 29 24 28 22 Z', '#8C6239') +
      stroke('M27 21 C29 25 33 25 34 21', '#006847', 1.4),
  },
  {
    name: 'Micronesia',
    accent: '#75B2DD',
    shapes:
      rect(0, 0, 60, 40, '#75B2DD') +
      star(30, 11, 3.4, '#ffffff') +
      star(39, 20, 3.4, '#ffffff') +
      star(30, 29, 3.4, '#ffffff') +
      star(21, 20, 3.4, '#ffffff'),
  },
  {
    name: 'Moldova',
    accent: '#0046AE',
    shapes:
      V(['#0046AE', '#FFD200', '#CC092F']) +
      shape('M27 14 L33 14 L34 20 L30 26 L26 20 Z', '#B07C4A') +
      dot(30, 18, 2.2, '#CC092F'),
  },
  {
    name: 'Monaco',
    accent: '#CE1126',
    shapes: H(['#CE1126', '#ffffff']),
  },
  {
    name: 'Mongolia',
    accent: '#C4272F',
    shapes:
      V(['#C4272F', '#015197', '#C4272F']) +
      rect(7, 10, 2.4, 20, '#FFD900') +
      dot(8.2, 12, 1.6, '#FFD900') +
      poly('5.6,17 10.8,17 8.2,21', '#FFD900') +
      rect(5.6, 25, 2, 2, '#FFD900') +
      rect(8.8, 25, 2, 2, '#FFD900'),
  },
  {
    name: 'Montenegro',
    accent: '#C40308',
    shapes:
      rect(0, 0, 60, 40, '#C40308') +
      rect(1.5, 1.5, 57, 37, 'none') +
      shape('M30 10 L38 14 L37 24 L30 30 L23 24 L22 14 Z', '#D4AE3A') +
      shape('M26 16 L34 16 L30 22 Z', '#C40308'),
  },
  {
    name: 'Morocco',
    accent: '#C1272D',
    shapes:
      rect(0, 0, 60, 40, '#C1272D') +
      stroke('M30 10.5 L35.6 27.5 L21.3 16.8 L38.7 16.8 L24.4 27.5 Z', '#006233', 1.8),
  },
  {
    name: 'Mozambique',
    accent: '#007168',
    shapes:
      H([['#007168', 1], ['#ffffff', 0.25], ['#000000', 1], ['#ffffff', 0.25], ['#FCE100', 1]]) +
      poly('0,0 28,20 0,40', '#D21034') +
      star(9, 20, 4.6, '#FCE100') +
      shape('M16 16 L22 20 L16 24 Z', '#ffffff'),
  },
  {
    name: 'Myanmar',
    accent: '#FECB00',
    shapes: H(['#FECB00', '#34B233', '#EA2839']) + star(30, 20, 7, '#ffffff'),
  },
  {
    name: 'Namibia',
    accent: '#003580',
    shapes:
      rect(0, 0, 60, 40, '#003580') +
      poly('0,40 60,0 60,40', '#009543') +
      poly('0,40 60,2 60,12 13,40', '#D21034') +
      poly('0,0 34,0 0,22', '#FFCE00') +
      sun(11, 10, 3.4, '#FFCE00', 12, 1.2),
  },
  {
    name: 'Nauru',
    accent: '#002B7F',
    shapes: rect(0, 0, 60, 40, '#002B7F') + rect(0, 17, 60, 5, '#FFC61E') + star(17, 31, 4, '#ffffff'),
  },
  {
    name: 'Nepal',
    accent: '#DC143C',
    shapes:
      poly('9,3 9,37 53,22 32,18 46,9 9,9', '#003893') +
      poly('11.5,6 11.5,34 47,21.5 30,17.5 41,11 11.5,11', '#DC143C') +
      dot(20, 24, 3.4, '#ffffff') +
      dot(19, 13.5, 2.8, '#ffffff'),
  },
  {
    name: 'Netherlands',
    accent: '#AE1C28',
    shapes: H(['#AE1C28', '#ffffff', '#21468B']),
  },
  {
    name: 'New Zealand',
    accent: '#00247D',
    shapes:
      rect(0, 0, 60, 40, '#00247D') +
      JACK_CANTON +
      star(44, 9, 2.6, '#CC142B') +
      star(52, 15, 2.6, '#CC142B') +
      star(46, 22, 2.6, '#CC142B') +
      star(53, 28, 2.6, '#CC142B'),
  },
  {
    name: 'Nicaragua',
    accent: '#0067C6',
    shapes: H(['#0067C6', '#ffffff', '#0067C6']) + ring(30, 20, 4.2, '#0067C6', 1.2) + shape('M27 18 L33 18 L30 23 Z', '#4C8C3C'),
  },
  {
    name: 'Niger',
    accent: '#E05206',
    shapes: H(['#E05206', '#ffffff', '#0DB02B']) + dot(30, 20, 4.4, '#E05206'),
  },
  {
    name: 'Nigeria',
    accent: '#008751',
    shapes: V(['#008751', '#ffffff', '#008751']),
  },
  {
    name: 'North Korea',
    accent: '#024FA2',
    shapes:
      H([['#024FA2', 1], ['#ffffff', 0.35], ['#ED1C27', 2], ['#ffffff', 0.35], ['#024FA2', 1]]) +
      dot(26, 18, 6.2, '#ffffff') +
      star(26, 18, 4.6, '#ED1C27'),
  },
  {
    name: 'North Macedonia',
    accent: '#D20000',
    shapes:
      rect(0, 0, 60, 40, '#D20000') +
      sun(30, 20, 5, '#FFE600', 8, 12),
  },
  {
    name: 'Norway',
    accent: '#BA0C2F',
    shapes:
      rect(0, 0, 60, 40, '#BA0C2F') +
      rect(16, 0, 10, 40, '#ffffff') +
      rect(0, 15, 60, 10, '#ffffff') +
      rect(18.6, 0, 4.8, 40, '#00205B') +
      rect(0, 17.6, 60, 4.8, '#00205B'),
  },
  {
    name: 'Oman',
    accent: '#DB161B',
    shapes:
      H(['#ffffff', '#DB161B', '#008000']) +
      rect(0, 0, 15, 40, '#DB161B') +
      shape('M4 12 L8 12 L8 16 L10 16 L10 20 L4 20 Z', '#ffffff'),
  },
  {
    name: 'Pakistan',
    accent: '#01411C',
    shapes:
      rect(0, 0, 60, 40, '#01411C') +
      rect(0, 0, 15, 40, '#ffffff') +
      crescent(35, 20, 8, '#ffffff') +
      star(40, 14, 3, '#ffffff'),
  },
  {
    name: 'Palau',
    accent: '#4AADD6',
    shapes: rect(0, 0, 60, 40, '#4AADD6') + dot(27, 20, 8, '#FFDE00'),
  },
  {
    name: 'Palestine',
    accent: '#007A3D',
    shapes: H(['#000000', '#ffffff', '#007A3D']) + poly('0,0 26,20 0,40', '#CE1126'),
  },
  {
    name: 'Panama',
    accent: '#005293',
    shapes:
      rect(0, 0, 30, 20, '#ffffff') +
      rect(30, 0, 30, 20, '#DA121A') +
      rect(0, 20, 30, 20, '#005293') +
      rect(30, 20, 30, 20, '#ffffff') +
      star(15, 10, 4.4, '#005293') +
      star(45, 30, 4.4, '#DA121A'),
  },
  {
    name: 'Papua New Guinea',
    accent: '#CE1126',
    shapes:
      poly('0,0 60,0 0,40', '#CE1126') +
      poly('60,0 60,40 0,40', '#000000') +
      shape('M30 8 C40 10 46 16 44 24 C40 20 34 18 30 16 Z', '#FFD700') +
      star(14, 12, 2.4, '#ffffff') +
      star(20, 22, 2.4, '#ffffff') +
      star(9, 24, 2.4, '#ffffff') +
      star(16, 32, 2.4, '#ffffff'),
  },
  {
    name: 'Paraguay',
    accent: '#D52B1E',
    shapes: H(['#D52B1E', '#ffffff', '#0038A8']) + ring(30, 20, 4.4, '#198A00', 1.4) + star(30, 20, 2.2, '#FEDF00'),
  },
  {
    name: 'Peru',
    accent: '#D91023',
    shapes: V(['#D91023', '#ffffff', '#D91023']),
  },
  {
    name: 'Philippines',
    accent: '#0038A8',
    shapes:
      H(['#0038A8', '#CE1126']) +
      poly('0,0 26,20 0,40', '#ffffff') +
      sun(9, 20, 3, '#FCD116', 8, 1.6) +
      star(4, 7, 2, '#FCD116') +
      star(4, 33, 2, '#FCD116') +
      star(13, 20, 2, '#FCD116'),
  },
  {
    name: 'Poland',
    accent: '#DC143C',
    shapes: H(['#ffffff', '#DC143C']),
  },
  {
    name: 'Portugal',
    accent: '#DA291C',
    shapes:
      V([['#046A38', 2], ['#DA291C', 3]]) +
      ring(24, 20, 6, '#FFE100', 1.6) +
      dot(24, 20, 3.2, '#ffffff') +
      dot(24, 20, 2, '#DA291C'),
  },
  {
    name: 'Qatar',
    accent: '#8D1B3D',
    shapes:
      rect(0, 0, 60, 40, '#8D1B3D') +
      rect(0, 0, 22, 40, '#ffffff') +
      poly('22,0 30,4.44 22,8.89 30,13.33 22,17.78 30,22.22 22,26.67 30,31.11 22,35.56 30,40', '#ffffff'),
  },
  {
    name: 'Romania',
    accent: '#002B7F',
    shapes: V(['#002B7F', '#FCD116', '#CE1126']),
  },
  {
    name: 'Russia',
    accent: '#0039A6',
    shapes: H(['#ffffff', '#0039A6', '#D52B1E']),
  },
  {
    name: 'Rwanda',
    accent: '#00A1DE',
    shapes:
      rect(0, 0, 60, 20, '#00A1DE') +
      rect(0, 20, 60, 4, '#FAD201') +
      rect(0, 24, 60, 16, '#20603D') +
      sun(41, 26, 3.4, '#E5BE01', 12, 1.4),
  },
  {
    name: 'Saint Kitts and Nevis',
    accent: '#009E49',
    shapes:
      rect(0, 0, 60, 40, '#009E49') +
      poly('60,0 60,40 20,40', '#CE1126') +
      stroke('M0,0 L60,40', '#000000', 6) +
      stroke('M0,0 L60,40', '#FCD116', 2) +
      star(22, 9, 2.2, '#ffffff') +
      star(27, 15, 2.2, '#ffffff'),
  },
  {
    name: 'Saint Lucia',
    accent: '#66CCFF',
    shapes:
      rect(0, 0, 60, 40, '#66CCFF') +
      poly('30,7 44,33 16,33', '#000000') +
      poly('30,10 41,31 19,31', '#ffffff') +
      poly('30,13 38,29 22,29', '#FCD116'),
  },
  {
    name: 'Saint Vincent and the Grenadines',
    accent: '#002674',
    shapes:
      V(['#002674', '#FCD116', '#0072C6']) +
      shape('M26 18 L30 22 L26 26 L22 22 Z', '#007A3D') +
      shape('M38 18 L42 22 L38 26 L34 22 Z', '#007A3D') +
      shape('M32 13 L36 17 L32 21 L28 17 Z', '#007A3D'),
  },
  {
    name: 'Samoa',
    accent: '#CE1126',
    shapes:
      rect(0, 0, 60, 40, '#CE1126') +
      rect(0, 0, 30, 20, '#002B7F') +
      star(22, 5, 2.2, '#ffffff') +
      star(25, 11, 2.2, '#ffffff') +
      star(19, 15, 2.2, '#ffffff') +
      star(13, 11, 2.2, '#ffffff') +
      star(11, 5, 2.2, '#ffffff'),
  },
  {
    name: 'San Marino',
    accent: '#5EB6E4',
    shapes:
      H(['#ffffff', '#5EB6E4']) +
      ring(30, 20, 4, '#4C8C3C', 1.2) +
      shape('M27 18 L33 18 L30 23 Z', '#7A5230'),
  },
  {
    name: 'São Tomé and Príncipe',
    accent: '#12AD2B',
    shapes:
      H([['#12AD2B', 1], ['#FFCE00', 1], ['#12AD2B', 1]]) +
      poly('0,0 24,20 0,40', '#D21034') +
      star(11, 14, 2.2, '#000000') +
      star(11, 26, 2.2, '#000000'),
  },
  {
    name: 'Saudi Arabia',
    accent: '#006C35',
    shapes:
      rect(0, 0, 60, 40, '#006C35') +
      rect(18, 15, 24, 2.4, '#ffffff') +
      rect(18, 20, 24, 2, '#ffffff') +
      rect(16, 26, 28, 1.8, '#ffffff') +
      shape('M20 26 L17 28 L18 25 Z', '#ffffff'),
  },
  {
    name: 'Senegal',
    accent: '#00853F',
    shapes: V(['#00853F', '#FDEF42', '#E31B23']) + star(30, 20, 4.4, '#00853F'),
  },
  {
    name: 'Serbia',
    accent: '#C6363C',
    shapes:
      H(['#C6363C', '#0C4076', '#ffffff']) +
      rect(23, 12, 14, 16, '#C6363C') +
      shape('M25 16 L30 14 L35 16 L35 22 L30 26 L25 22 Z', '#EDB92E'),
  },
  {
    name: 'Seychelles',
    accent: '#003F87',
    shapes:
      poly('0,40 60,40 0,0', '#003F87') +
      poly('0,40 0,0 13,0', '#FCD856') +
      poly('0,40 13,0 26,0', '#D62828') +
      poly('0,40 26,0 40,0', '#ffffff') +
      poly('0,40 40,0 60,0 60,40', '#007A3D'),
  },
  {
    name: 'Sierra Leone',
    accent: '#0072C6',
    shapes: H(['#1EB53A', '#ffffff', '#0072C6']),
  },
  {
    name: 'Singapore',
    accent: '#ED2939',
    shapes:
      H(['#ED2939', '#ffffff']) +
      crescent(17, 10, 6.4, '#ffffff') +
      star(24, 5.5, 1.7, '#ffffff') +
      star(27, 9, 1.7, '#ffffff') +
      star(26, 13.5, 1.7, '#ffffff') +
      star(22, 16, 1.7, '#ffffff') +
      star(20, 11, 1.7, '#ffffff'),
  },
  {
    name: 'Slovakia',
    accent: '#0B4EA2',
    shapes:
      H(['#ffffff', '#0B4EA2', '#EE1C25']) +
      shape('M17 11 L29 11 L29 21 L23 27 L17 21 Z', '#EE1C25') +
      stroke('M23 13 L23 25 M19 17 L27 17', '#ffffff', 1.6),
  },
  {
    name: 'Slovenia',
    accent: '#005DA4',
    shapes:
      H(['#ffffff', '#005DA4', '#ED1C24']) +
      shape('M20 10 L30 10 L30 20 L25 25 L20 20 Z', '#005DA4') +
      stroke('M25 12 L25 23', '#ffffff', 1.4),
  },
  {
    name: 'Solomon Islands',
    accent: '#0051BA',
    shapes:
      poly('0,0 60,0 0,40', '#0051BA') +
      poly('60,0 60,40 0,40', '#215B33') +
      stroke('M0,40 L60,0', '#FCD116', 4) +
      star(9, 8, 2, '#ffffff') +
      star(15, 6, 2, '#ffffff') +
      star(20, 10, 2, '#ffffff') +
      star(15, 14, 2, '#ffffff') +
      star(9, 15, 2, '#ffffff'),
  },
  {
    name: 'Somalia',
    accent: '#4189DD',
    shapes: rect(0, 0, 60, 40, '#4189DD') + star(30, 20, 8, '#ffffff'),
  },
  {
    name: 'South Africa',
    accent: '#007A4D',
    shapes:
      rect(0, 0, 60, 40, '#007A4D') +
      poly('0,0 60,0 60,10 0,22', '#DE3831') +
      poly('0,40 60,40 60,30 0,18', '#002395') +
      poly('0,19 60,9 60,12 0,22', '#ffffff') +
      poly('0,21 60,31 60,28 0,18', '#ffffff') +
      poly('0,19 26,20 0,21', '#FFB612') +
      poly('0,0 0,40 17,20', '#000000'),
  },
  {
    name: 'South Korea',
    accent: '#CD2E3A',
    shapes:
      rect(0, 0, 60, 40, '#ffffff') +
      dot(30, 20, 8, '#CD2E3A') +
      shape('M30 12 A4 4 0 0 0 30 20 A4 4 0 0 1 30 28 A8 8 0 0 1 30 12 Z', '#0047A0') +
      rect(8, 9, 9, 1.6, '#000000') +
      rect(8, 12, 9, 1.6, '#000000') +
      rect(8, 15, 9, 1.6, '#000000') +
      rect(43, 23, 9, 1.6, '#000000') +
      rect(43, 26, 9, 1.6, '#000000') +
      rect(43, 29, 9, 1.6, '#000000'),
  },
  {
    name: 'South Sudan',
    accent: '#078930',
    shapes:
      H([['#000000', 1], ['#ffffff', 0.22], ['#DA121A', 1], ['#ffffff', 0.22], ['#078930', 1]]) +
      poly('0,0 26,20 0,40', '#0F47AF') +
      star(10, 20, 4.6, '#FCDD09'),
  },
  {
    name: 'Spain',
    accent: '#AA151B',
    shapes:
      rect(0, 0, 60, 40, '#F1BF00') +
      rect(0, 0, 60, 10, '#AA151B') +
      rect(0, 30, 60, 10, '#AA151B') +
      rect(14, 15, 7, 10, '#AA151B') +
      rect(15.5, 17, 4, 6, '#F1BF00'),
  },
  {
    name: 'Sri Lanka',
    accent: '#8D153A',
    shapes:
      rect(0, 0, 60, 40, '#FFB700') +
      rect(2.5, 2.5, 15, 35, '#00534E') +
      rect(5, 2.5, 10, 35, '#FF7900') +
      rect(18, 2.5, 39.5, 35, '#8D153A') +
      shape('M30 12 C36 12 38 18 36 24 C34 28 28 28 26 24 C24 18 26 12 30 12 Z', '#FFB700') +
      stroke('M24 14 L24 27', '#FFB700', 1.6),
  },
  {
    name: 'Sudan',
    accent: '#D21034',
    shapes: H(['#D21034', '#ffffff', '#000000']) + poly('0,0 20,20 0,40', '#007229'),
  },
  {
    name: 'Suriname',
    accent: '#377E3F',
    shapes:
      rect(0, 0, 60, 40, '#377E3F') +
      rect(0, 15, 60, 10, '#B40A2D') +
      rect(0, 14, 60, 1.5, '#ffffff') +
      rect(0, 25, 60, 1.5, '#ffffff') +
      star(30, 20, 5, '#ECC81D'),
  },
  {
    name: 'Sweden',
    accent: '#006AA7',
    shapes:
      rect(0, 0, 60, 40, '#006AA7') +
      rect(17, 0, 8, 40, '#FECC00') +
      rect(0, 16, 60, 8, '#FECC00'),
  },
  {
    name: 'Switzerland',
    accent: '#D52B1E',
    shapes:
      rect(0, 0, 60, 40, '#D52B1E') +
      rect(17, 17, 26, 6, '#ffffff') +
      rect(27, 7, 6, 26, '#ffffff'),
  },
  {
    name: 'Syria',
    accent: '#007A3D',
    shapes:
      H(['#007A3D', '#ffffff', '#000000']) +
      star(24, 20, 2.6, '#CE1126') +
      star(30, 20, 2.6, '#CE1126') +
      star(36, 20, 2.6, '#CE1126'),
  },
  {
    name: 'Tajikistan',
    accent: '#CC0000',
    shapes:
      H([['#CC0000', 1], ['#ffffff', 1], ['#006600', 1]]) +
      shape('M27 18 L33 18 L33 21 L30 23 L27 21 Z', '#F8C300') +
      star(24, 13, 1.5, '#F8C300') +
      star(30, 11, 1.5, '#F8C300') +
      star(36, 13, 1.5, '#F8C300'),
  },
  {
    name: 'Tanzania',
    accent: '#1EB53A',
    shapes:
      rect(0, 0, 60, 40, '#1EB53A') +
      poly('0,40 60,0 60,40', '#00A3DD') +
      stroke('M0,40 L60,0', '#FCD116', 9) +
      stroke('M0,40 L60,0', '#000000', 5),
  },
  {
    name: 'Thailand',
    accent: '#A51931',
    shapes: H([['#A51931', 1], ['#F4F5F8', 1], ['#2D2A4A', 2], ['#F4F5F8', 1], ['#A51931', 1]]),
  },
  {
    name: 'Timor-Leste',
    accent: '#DC241F',
    shapes:
      rect(0, 0, 60, 40, '#DC241F') +
      poly('0,0 34,20 0,40', '#FFC726') +
      poly('0,0 22,20 0,40', '#ffffff') +
      star(10, 20, 4.4, '#000000', 90) +
      star(8, 20, 3.4, '#ffffff', 90),
  },
  {
    name: 'Togo',
    accent: '#006A4E',
    shapes:
      H(['#006A4E', '#FFCE00', '#006A4E', '#FFCE00', '#006A4E']) +
      rect(0, 0, 24, 24, '#D21034') +
      star(12, 12, 5, '#ffffff'),
  },
  {
    name: 'Tonga',
    accent: '#C10000',
    shapes:
      rect(0, 0, 60, 40, '#C10000') +
      rect(0, 0, 24, 16, '#ffffff') +
      rect(9, 3, 6, 10, '#C10000') +
      rect(4, 5, 16, 5, '#C10000'),
  },
  {
    name: 'Trinidad and Tobago',
    accent: '#CE1126',
    shapes:
      rect(0, 0, 60, 40, '#CE1126') +
      stroke('M0,4 L56,40', '#ffffff', 8) +
      stroke('M0,6 L58,40', '#000000', 4),
  },
  {
    name: 'Tunisia',
    accent: '#E70013',
    shapes:
      rect(0, 0, 60, 40, '#E70013') +
      dot(30, 20, 10, '#ffffff') +
      crescent(30, 20, 6.4, '#E70013') +
      star(35, 20, 3.2, '#E70013', 90),
  },
  {
    name: 'Türkiye',
    accent: '#E30A17',
    shapes:
      rect(0, 0, 60, 40, '#E30A17') +
      crescent(24, 20, 8.4, '#ffffff') +
      star(36, 20, 4.6, '#ffffff', 90),
  },
  {
    name: 'Turkmenistan',
    accent: '#00843D',
    shapes:
      rect(0, 0, 60, 40, '#00843D') +
      rect(16, 0, 9, 40, '#D22630') +
      star(20.5, 8, 1.5, '#ffffff') +
      star(20.5, 16, 1.5, '#ffffff') +
      star(20.5, 24, 1.5, '#ffffff') +
      star(20.5, 32, 1.5, '#ffffff') +
      crescent(32, 14, 5, '#ffffff') +
      star(32, 22, 2, '#ffffff'),
  },
  {
    name: 'Tuvalu',
    accent: '#5B97B1',
    shapes:
      rect(0, 0, 60, 40, '#5B97B1') +
      JACK_CANTON +
      star(40, 8, 1.8, '#FFCE00') +
      star(48, 12, 1.8, '#FFCE00') +
      star(54, 18, 1.8, '#FFCE00') +
      star(44, 20, 1.8, '#FFCE00') +
      star(52, 26, 1.8, '#FFCE00') +
      star(40, 30, 1.8, '#FFCE00') +
      star(48, 34, 1.8, '#FFCE00') +
      star(56, 34, 1.8, '#FFCE00') +
      star(34, 36, 1.8, '#FFCE00'),
  },
  {
    name: 'Uganda',
    accent: '#FCDC04',
    shapes:
      H(['#000000', '#FCDC04', '#D90000', '#000000', '#FCDC04', '#D90000']) +
      dot(30, 20, 8, '#ffffff') +
      shape('M27 16 C31 15 33 18 32 21 C31 24 28 24 27 22 Z', '#8C8C8C'),
  },
  {
    name: 'Ukraine',
    accent: '#0057B7',
    shapes: H(['#0057B7', '#FFD700']),
  },
  {
    name: 'United Arab Emirates',
    accent: '#00732F',
    shapes:
      H(['#00732F', '#ffffff', '#000000']) +
      rect(0, 0, 15, 40, '#FF0000'),
  },
  {
    name: 'United Kingdom',
    accent: '#012169',
    shapes: JACK,
  },
  {
    name: 'United States',
    accent: '#3C3B6E',
    shapes:
      rect(0, 0, 60, 40, '#ffffff') +
      Array.from(
        { length: 7 },
        (_, i) => `<rect y="${((i * 2 * 40) / 13).toFixed(2)}" width="60" height="${(40 / 13).toFixed(2)}" fill="#B22234"/>`,
      ).join('') +
      rect(0, 0, 24, 21.54, '#3C3B6E') +
      Array.from({ length: 5 }, (_, row) =>
        Array.from(
          { length: 6 },
          (_, col) =>
            dot(2.4 + col * 3.9 + (row % 2 === 0 ? 0 : 1.9), 2.2 + row * 4.3, 0.75, '#ffffff'),
        ).join(''),
      ).join(''),
  },
  {
    name: 'Uruguay',
    accent: '#0038A8',
    shapes:
      H(['#ffffff', '#0038A8', '#ffffff', '#0038A8', '#ffffff', '#0038A8', '#ffffff', '#0038A8', '#ffffff']) +
      rect(0, 0, 24, 13.34, '#ffffff') +
      sun(12, 7, 3, '#F6B40E', 12, 1.2),
  },
  {
    name: 'Uzbekistan',
    accent: '#0099B5',
    shapes:
      H([['#0099B5', 1], ['#CE1126', 0.12], ['#ffffff', 1], ['#CE1126', 0.12], ['#1EB53A', 1]]) +
      crescent(12, 8, 4.6, '#ffffff') +
      star(20, 5, 1.4, '#ffffff') +
      star(24, 8, 1.4, '#ffffff') +
      star(20, 11, 1.4, '#ffffff'),
  },
  {
    name: 'Vanuatu',
    accent: '#D21034',
    shapes:
      poly('0,0 60,0 60,40 0,40', '#009543') +
      poly('0,0 60,0 60,14 0,20', '#D21034') +
      poly('0,0 28,20 0,40', '#000000') +
      stroke('M0,20 L60,20', '#FDCE12', 3) +
      stroke('M0,0 L28,20 L0,40', '#FDCE12', 3) +
      shape('M8 14 C14 16 14 24 8 26 C10 22 10 18 8 14 Z', '#FDCE12'),
  },
  {
    name: 'Vatican City',
    accent: '#FFE000',
    shapes:
      V(['#FFE000', '#ffffff']) +
      dot(36, 12, 3, '#C8A415') +
      stroke('M36 15 L33 28 M36 15 L39 28', '#C8A415', 1.6),
  },
  {
    name: 'Venezuela',
    accent: '#FFCC00',
    shapes:
      H(['#FFCC00', '#00247D', '#CF142B']) +
      star(24, 17, 1.5, '#ffffff') +
      star(27, 15, 1.5, '#ffffff') +
      star(30, 14, 1.5, '#ffffff') +
      star(33, 15, 1.5, '#ffffff') +
      star(36, 17, 1.5, '#ffffff') +
      star(26, 20, 1.5, '#ffffff') +
      star(34, 20, 1.5, '#ffffff') +
      star(30, 21, 1.5, '#ffffff'),
  },
  {
    name: 'Vietnam',
    accent: '#DA251D',
    shapes:
      rect(0, 0, 60, 40, '#DA251D') +
      star(30, 20, 10, '#FFFF00'),
  },
  {
    name: 'Yemen',
    accent: '#CE1126',
    shapes: H(['#CE1126', '#ffffff', '#000000']),
  },
  {
    name: 'Zambia',
    accent: '#198A00',
    shapes:
      rect(0, 0, 60, 40, '#198A00') +
      rect(42, 16, 6, 24, '#DE2010') +
      rect(48, 16, 6, 24, '#000000') +
      rect(54, 16, 6, 24, '#EF7D00') +
      shape('M31 15 C36 11 42 12 44 10 C42 14 36 17 31 15 Z', '#EF7D00'),
  },
  {
    name: 'Zimbabwe',
    accent: '#006400',
    shapes:
      H([
        ['#006400', 1],
        ['#FFD200', 1],
        ['#D40000', 1],
        ['#000000', 1],
        ['#D40000', 1],
        ['#FFD200', 1],
        ['#006400', 1],
      ]) +
      poly('0,0 26,20 0,40', '#ffffff') +
      star(10, 20, 5, '#D40000') +
      shape('M10 15 C14 15 15 18 13 20 C11 22 8 21 8 19 Z', '#FFD200'),
  },
];

export const FLAG_COUNT = NATIONS.length;

const ROMAN = ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function wrap(index: number): number {
  const rounded = Math.round(index);
  return ((rounded % FLAG_COUNT) + FLAG_COUNT) % FLAG_COUNT;
}

export function flagCode(index: number): string {
  return FLAG_CODES[wrap(index)] ?? 'un';
}

export function nationName(index: number): string {
  const cycle = Math.floor(Math.round(index) / FLAG_COUNT);
  const base = NATIONS[wrap(index)].name;
  return cycle <= 0 ? base : `${base} ${ROMAN[cycle] ?? cycle + 1}`;
}

export function flagAccent(index: number): string {
  return NATIONS[wrap(index)].accent;
}

const CDN = 'https://flagcdn.com/w160';

export function flagDataUrl(index: number): string {
  return `${CDN}/${flagCode(index)}.png`;
}

const cache = new Map<number, string>();

export function flagFallbackUrl(index: number): string {
  const key = wrap(index);
  const hit = cache.get(key);
  if (hit) return hit;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">${NATIONS[key].shapes}</svg>`;
  const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  cache.set(key, url);
  return url;
}
