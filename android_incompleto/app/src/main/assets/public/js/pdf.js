// =====================================================
// REHABPOD — ESCRITOR DE PDF MÍNIMO (sin dependencias)
//
// Genera PDF 1.4 con texto (Helvetica / Helvetica-Bold, WinAnsi), líneas,
// rectángulos, polilíneas y círculos vectoriales, en varias páginas A4. Suficiente
// para informes con gráficos y tablas, funciona sin conexión y pesa muy poco.
//
// Coordenadas en puntos (1 pt = 1/72 in) con el origen ARRIBA a la izquierda.
// Se carga antes de app.js; expone `RehabPDF` y module.exports.
// =====================================================

(function (raiz) {
  "use strict";

  const A4 = { ancho: 595.28, alto: 841.89 };

  // Anchos (por 1000 unidades) de los caracteres 32..255 en WinAnsi, tomados de
  // las métricas oficiales de Helvetica y Helvetica-Bold.
  const ANCHOS = {
    normal: [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 761,
    556, 0, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0,
    0, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 0, 500, 667,
    278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333,
    400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611,
    667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278,
    722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
    556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500,
    ],
    negrita: [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
    975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
    333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
    611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 761,
    556, 0, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0,
    0, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 0, 500, 667,
    278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333,
    400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611,
    722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278,
    722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
    556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278,
    611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556,
    ],
  };

  // Caracteres Unicode fuera de Latin-1 que sí existen en WinAnsi (cp1252).
  const ESPECIALES = { "€": 128, "‚": 130, "„": 132, "…": 133, "†": 134, "‡": 135, "‰": 137, "‹": 139, "‘": 145, "’": 146, "“": 147, "”": 148, "•": 149, "–": 150, "—": 151, "™": 153, "›": 155 };

  /** Convierte un texto a códigos WinAnsi; lo que no existe se sustituye por "?" (o se omite si es invisible). */
  function codificar(texto) {
    const salida = [];
    for (const ch of String(texto == null ? "" : texto)) {
      const c = ch.codePointAt(0);
      if (c === 0x200d || (c >= 0xfe00 && c <= 0xfe0f)) continue; // uniones y selectores de emoji
      if (c >= 32 && c <= 126) salida.push(c);
      else if (c >= 160 && c <= 255) salida.push(c);
      else if (ESPECIALES[ch]) salida.push(ESPECIALES[ch]);
      else if (c === 9 || c === 32 || c === 0x00a0) salida.push(32);
      else if (c === 10 || c === 13) salida.push(32);
      else if (c >= 0x1f000 || (c >= 0x2600 && c <= 0x27bf)) continue; // emojis y símbolos: se omiten
      else salida.push(63);
    }
    return salida;
  }

  function anchoDe(texto, tam, negrita) {
    const tabla = negrita ? ANCHOS.negrita : ANCHOS.normal;
    let total = 0;
    for (const c of codificar(texto)) total += tabla[c - 32] || 0;
    return (total * tam) / 1000;
  }

  /** Parte un texto en líneas que caben en `max` puntos (respeta saltos de línea). */
  function partirTexto(texto, tam, max, negrita) {
    const lineas = [];
    String(texto == null ? "" : texto)
      .split(/\r?\n/)
      .forEach((parrafo) => {
        const palabras = parrafo.split(/\s+/).filter(Boolean);
        if (!palabras.length) return lineas.push("");
        let actual = "";
        palabras.forEach((p) => {
          // Una palabra más larga que la línea se corta.
          while (anchoDe(p, tam, negrita) > max && p.length > 1) {
            let n = p.length - 1;
            while (n > 1 && anchoDe(p.slice(0, n), tam, negrita) > max) n--;
            if (actual) {
              lineas.push(actual);
              actual = "";
            }
            lineas.push(p.slice(0, n));
            p = p.slice(n);
          }
          const prueba = actual ? actual + " " + p : p;
          if (actual && anchoDe(prueba, tam, negrita) > max) {
            lineas.push(actual);
            actual = p;
          } else actual = prueba;
        });
        lineas.push(actual);
      });
    return lineas;
  }

  const n = (x) => {
    const s = (Math.round(x * 100) / 100).toString();
    return s === "-0" ? "0" : s;
  };

  function color(c) {
    if (typeof c === "string") {
      const m = /^#?([0-9a-f]{6})$/i.exec(c);
      if (!m) return [0, 0, 0];
      const v = parseInt(m[1], 16);
      return [(v >> 16) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
    }
    return c || [0, 0, 0];
  }
  const rgb = (c) => color(c).map((x) => n(x)).join(" ");

  const escapar = (bytes) =>
    bytes
      .map((b) => (b === 40 || b === 41 || b === 92 ? "\\" + String.fromCharCode(b) : String.fromCharCode(b)))
      .join("");

  class Documento {
    constructor(opciones) {
      const o = opciones || {};
      this.titulo = o.titulo || "Documento";
      this.autor = o.autor || "RehabPod";
      this.ancho = A4.ancho;
      this.alto = A4.alto;
      this.paginas = [];
      this.nuevaPagina();
    }

    nuevaPagina() {
      this.paginas.push([]);
      this._idx = this.paginas.length - 1;
      return this.paginas.length;
    }

    /** Número de páginas creadas. */
    get pagina() {
      return this.paginas.length;
    }

    _op(texto) {
      this.paginas[this._idx].push(texto);
    }

    /** Dibuja sobre una página anterior (p. ej. para "Página x de y" al final). */
    enPagina(i, fn) {
      const guardada = this._idx;
      this._idx = i - 1;
      try {
        fn();
      } finally {
        this._idx = guardada;
      }
    }

    rect(x, y, w, h, o) {
      o = o || {};
      const partes = ["q"];
      if (o.relleno) partes.push(`${rgb(o.relleno)} rg`);
      if (o.borde) partes.push(`${rgb(o.borde)} RG ${n(o.grosor || 1)} w`);
      const yy = this.alto - y - h;
      if (o.radio) {
        const r = Math.min(o.radio, w / 2, h / 2);
        const k = 0.5523 * r;
        partes.push(
          `${n(x + r)} ${n(yy)} m ${n(x + w - r)} ${n(yy)} l ${n(x + w - r + k)} ${n(yy)} ${n(x + w)} ${n(yy + r - k)} ${n(x + w)} ${n(yy + r)} c ` +
            `${n(x + w)} ${n(yy + h - r)} l ${n(x + w)} ${n(yy + h - r + k)} ${n(x + w - r + k)} ${n(yy + h)} ${n(x + w - r)} ${n(yy + h)} c ` +
            `${n(x + r)} ${n(yy + h)} l ${n(x + r - k)} ${n(yy + h)} ${n(x)} ${n(yy + h - r + k)} ${n(x)} ${n(yy + h - r)} c ` +
            `${n(x)} ${n(yy + r)} l ${n(x)} ${n(yy + r - k)} ${n(x + r - k)} ${n(yy)} ${n(x + r)} ${n(yy)} c h`
        );
      } else {
        partes.push(`${n(x)} ${n(yy)} ${n(w)} ${n(h)} re`);
      }
      partes.push(o.relleno && o.borde ? "B" : o.relleno ? "f" : "S");
      partes.push("Q");
      this._op(partes.join(" "));
    }

    linea(x1, y1, x2, y2, o) {
      o = o || {};
      const dash = o.guiones ? `[${o.guiones.join(" ")}] 0 d` : "[] 0 d";
      this._op(`q ${rgb(o.color || "#000000")} RG ${n(o.grosor || 1)} w ${dash} ${n(x1)} ${n(this.alto - y1)} m ${n(x2)} ${n(this.alto - y2)} l S Q`);
    }

    /** Polilínea; con `relleno` y `cerrar` también rellena el área. */
    poli(puntos, o) {
      o = o || {};
      if (puntos.length < 2) return;
      const trazo = puntos.map((p, i) => `${n(p.x)} ${n(this.alto - p.y)} ${i ? "l" : "m"}`).join(" ");
      const partes = ["q"];
      if (o.relleno) partes.push(`${rgb(o.relleno)} rg`);
      if (o.color) partes.push(`${rgb(o.color)} RG ${n(o.grosor || 1)} w 1 j 1 J`);
      partes.push(trazo);
      if (o.cerrar) partes.push("h");
      partes.push(o.relleno && o.color ? "B" : o.relleno ? "f" : "S");
      partes.push("Q");
      this._op(partes.join(" "));
    }

    circulo(cx, cy, r, o) {
      o = o || {};
      const k = 0.5523 * r;
      const y = this.alto - cy;
      const partes = ["q"];
      if (o.relleno) partes.push(`${rgb(o.relleno)} rg`);
      if (o.borde) partes.push(`${rgb(o.borde)} RG ${n(o.grosor || 1)} w`);
      partes.push(
        `${n(cx + r)} ${n(y)} m ${n(cx + r)} ${n(y + k)} ${n(cx + k)} ${n(y + r)} ${n(cx)} ${n(y + r)} c ` +
          `${n(cx - k)} ${n(y + r)} ${n(cx - r)} ${n(y + k)} ${n(cx - r)} ${n(y)} c ` +
          `${n(cx - r)} ${n(y - k)} ${n(cx - k)} ${n(y - r)} ${n(cx)} ${n(y - r)} c ` +
          `${n(cx + k)} ${n(y - r)} ${n(cx + r)} ${n(y - k)} ${n(cx + r)} ${n(y)} c h`
      );
      partes.push(o.relleno && o.borde ? "B" : o.relleno ? "f" : "S");
      partes.push("Q");
      this._op(partes.join(" "));
    }

    /**
     * Texto en (x, y) con y = LÍNEA BASE. alinear: "izq" | "centro" | "der".
     * Devuelve el ancho usado.
     */
    texto(txt, x, y, o) {
      o = o || {};
      const tam = o.tam || 11;
      const negrita = !!o.negrita;
      const ancho = anchoDe(txt, tam, negrita);
      let xx = x;
      if (o.alinear === "centro") xx = x - ancho / 2;
      else if (o.alinear === "der") xx = x - ancho;
      const bytes = codificar(txt);
      if (!bytes.length) return 0;
      this._op(`BT ${rgb(o.color || "#000000")} rg /${negrita ? "F2" : "F1"} ${n(tam)} Tf ${n(xx)} ${n(this.alto - y)} Td (${escapar(bytes)}) Tj ET`);
      return ancho;
    }

    /** Párrafo con ajuste de línea. Devuelve la y siguiente (bajo la última línea). */
    parrafo(txt, x, y, ancho, o) {
      o = o || {};
      const tam = o.tam || 11;
      const interlinea = o.interlinea || tam * 1.35;
      const lineas = partirTexto(txt, tam, ancho, !!o.negrita);
      lineas.forEach((l, i) => {
        if (l) this.texto(l, x, y + tam + i * interlinea, o);
      });
      return y + lineas.length * interlinea;
    }

    alturaParrafo(txt, ancho, o) {
      o = o || {};
      const tam = o.tam || 11;
      return partirTexto(txt, tam, ancho, !!o.negrita).length * (o.interlinea || tam * 1.35);
    }

    /** Devuelve los bytes del PDF (Uint8Array). */
    salida() {
      const objetos = [];
      const nuevo = (contenido) => {
        objetos.push(contenido);
        return objetos.length;
      };
      const catalogo = nuevo(null);
      const raizPaginas = nuevo(null);
      const f1 = nuevo("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
      const f2 = nuevo("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
      const info = nuevo(`<< /Title (${escapar(codificar(this.titulo))}) /Author (${escapar(codificar(this.autor))}) /Producer (RehabPod) /Creator (RehabPod) >>`);
      const idsPagina = [];
      this.paginas.forEach((ops) => {
        const flujo = ops.join("\n");
        const idContenido = nuevo({ flujo });
        idsPagina.push(nuevo(`<< /Type /Page /Parent ${raizPaginas} 0 R /MediaBox [0 0 ${n(this.ancho)} ${n(this.alto)}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${idContenido} 0 R >>`));
      });
      objetos[catalogo - 1] = `<< /Type /Catalog /Pages ${raizPaginas} 0 R >>`;
      objetos[raizPaginas - 1] = `<< /Type /Pages /Count ${idsPagina.length} /Kids [${idsPagina.map((i) => i + " 0 R").join(" ")}] >>`;

      // Cada carácter del PDF es un byte (latin1): se ensambla como cadena binaria.
      let cuerpo = "%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n";
      const desplazamientos = [];
      objetos.forEach((obj, i) => {
        desplazamientos.push(cuerpo.length);
        const contenido = typeof obj === "string" ? obj : `<< /Length ${obj.flujo.length} >>\nstream\n${obj.flujo}\nendstream`;
        cuerpo += `${i + 1} 0 obj\n${contenido}\nendobj\n`;
      });
      const xref = cuerpo.length;
      cuerpo += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
      desplazamientos.forEach((d) => {
        cuerpo += `${String(d).padStart(10, "0")} 00000 n \n`;
      });
      cuerpo += `trailer\n<< /Size ${objetos.length + 1} /Root ${catalogo} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

      const bytes = new Uint8Array(cuerpo.length);
      for (let i = 0; i < cuerpo.length; i++) bytes[i] = cuerpo.charCodeAt(i) & 255;
      return bytes;
    }
  }

  const API = { A4, Documento, anchoDe, partirTexto, codificar };
  raiz.RehabPDF = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
