// Mide el contraste de cada texto visible contra su fondo efectivo (primer ancestro con
// fondo opaco; mezcla los translúcidos). Omite textos sobre degradados/imágenes y emojis.
// Devuelve la lista de textos por debajo de AA en la pantalla activa.
async function medirContraste(page) {
  return page.evaluate(() => {
      const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[, /]+/).map(Number); return { r, g, b, a }; };
      const mezclar = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
      const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const fondo = (e) => { const pila = []; for (let x = e; x; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.backgroundImage !== "none") return null; const c = parse(cs.backgroundColor); if (c && c.a > 0) { pila.push(c); if (c.a >= 1) break; } } let base = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 }; if (base.a < 1) base = { r: 255, g: 255, b: 255, a: 1 }; return pila.reverse().reduce((acc, c) => mezclar(c, acc), base); };
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden" && getComputedStyle(e).opacity !== "0"; };
      const raiz = document.querySelector(".pantalla.activa"); const out = []; const it = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
      while (it.nextNode()) {
        const t = it.currentNode, e = t.parentElement; if (!t.textContent.trim() || !vis(e)) continue;
        const cs = getComputedStyle(e); const fg = parse(cs.color); if (!fg) continue;
        const bg = fondo(e); if (!bg) continue; /* fondo con degradado/imagen: no medible */ if (!/[A-Za-zÁ-ú0-9]/.test(t.textContent)) continue; /* solo emoji/símbolos */ const fgm = mezclar(fg, bg);
        const l1 = lum(fgm), l2 = lum(bg); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        const px = parseFloat(cs.fontSize), grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight) >= 700);
        if (ratio < (grande ? 3 : 4.5)) out.push(`${ratio.toFixed(2)} ${cs.color} sobre rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)}) .${(e.className || e.tagName).toString().slice(0, 40)} "${t.textContent.trim().slice(0, 28)}"`);
      }
      return out;
  });
}

module.exports = { medirContraste };
