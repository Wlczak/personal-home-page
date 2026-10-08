import type { APIRoute } from 'astro';
import sharp from 'sharp';

export const GET: APIRoute = async () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#f4f1e8"/>
    <rect x="56" y="52" width="1088" height="526" rx="8" fill="#fffcf5" stroke="#243c34" stroke-width="4"/>
    <path d="M56 105H1144" stroke="#243c34" stroke-width="3"/>
    <circle cx="85" cy="80" r="7" fill="#cf775c"/><circle cx="110" cy="80" r="7" fill="#dbb864"/><circle cx="135" cy="80" r="7" fill="#36836e"/>
    <text x="92" y="171" fill="#52645b" font-family="monospace" font-size="23">~/adam/home</text>
    <text x="88" y="289" fill="#243c34" font-family="sans-serif" font-weight="bold" font-size="83">Adam Vlček</text>
    <text x="92" y="361" fill="#28674f" font-family="sans-serif" font-size="44">Backend developer. Curious by default.</text>
    <path d="M92 412H1108" stroke="#c6c9b9" stroke-width="2"/>
    <text x="92" y="486" fill="#52645b" font-family="monospace" font-size="28">GO / PHP / JAVA</text>
    <text x="850" y="486" fill="#243c34" font-family="monospace" font-size="28">wlczak.net</text>
  </svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
