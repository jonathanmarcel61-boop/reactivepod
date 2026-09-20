// =====================================================
// REHABPOD — MOTIVACIÓN: META SEMANAL, VOZ Y COMPARTIR
//
// Une los módulos puros (metas.js, voz.js, compartir.js) con la interfaz:
//  · tarjeta "meta semanal" en Inicio y su ajuste;
//  · voz en español: cuenta atrás, transiciones de rutina y felicitaciones;
//  · botón "Compartir por WhatsApp" en Resultados y en el resumen de la rutina;
//  · aviso una sola vez por semana cuando se cumple la meta.
//
// Se carga DESPUÉS de app.js y de asistente.js.
// =====================================================

(function () {
  "use strict";

  const M = window.RehabMetas;
  const V = window.RehabVoz;
  const C = window.RehabCompartir;
  if (!M || typeof obtenerPerfilActivo !== "function") return;

  const CLAVE_AVISADA = "rehabpodMetaAvisada";

  const perfil = () => obtenerPerfilActivo() || { nombre: "", historial: [] };
  const historial = () => perfil().historial || [];
  const plural = (n, uno, varios) => (n === 1 ? uno : varios);

  // -----------------------------------------------------
  // Tarjeta de meta semanal
  // -----------------------------------------------------
  function pintarMeta() {
    const tarjeta = document.getElementById("tarjetaMetaSemanal");
    if (!tarjeta) return;
    const semana = M.estadoSemana(historial(), M.leerMeta());
    const racha = M.calcularRacha(historial());

    const titulo = document.getElementById("metaSemanalTitulo");
    const sub = document.getElementById("metaSemanalSub");
    titulo.textContent = `${semana.hechos} de ${semana.meta} ${plural(semana.meta, "día", "días")} esta semana`;

    let texto;
    if (semana.cumplida) texto = "¡Meta cumplida! Gran semana.";
    else if (racha.entrenoHoy) texto = `Te ${plural(semana.restantes, "falta", "faltan")} ${semana.restantes} ${plural(semana.restantes, "día", "días")} para tu meta.`;
    else texto = semana.hechos ? `Entrena hoy: te ${plural(semana.restantes, "falta", "faltan")} ${semana.restantes} ${plural(semana.restantes, "día", "días")}.` : "Entrena hoy para empezar tu semana.";
    if (racha.racha >= 2) texto += ` Racha: ${racha.racha} días.`;
    sub.textContent = texto;

    tarjeta.classList.toggle("metaSemanal--cumplida", semana.cumplida);
    document.getElementById("metaSemanalDias").innerHTML = semana.dias
      .map((d) => {
        const estado = d.entreno ? "entrenado" : d.futuro ? "pendiente" : d.esHoy ? "hoy, sin entrenar" : "sin entrenar";
        const clases = ["metaDia", d.entreno ? "metaDia--hecho" : "", d.esHoy ? "metaDia--hoy" : ""].filter(Boolean).join(" ");
        return `<li class="${clases}" aria-label="${d.nombre}: ${estado}"><span aria-hidden="true">${d.entreno ? "✓" : d.etiqueta}</span></li>`;
      })
      .join("");
  }

  const resumenBase = actualizarResumenInicio;
  actualizarResumenInicio = function () {
    const r = resumenBase.apply(this, arguments);
    try {
      pintarMeta();
    } catch (error) {
      console.error("Meta semanal", error);
    }
    return r;
  };

  // -----------------------------------------------------
  // Ajustes: meta y voz
  // -----------------------------------------------------
  const selMeta = document.getElementById("ajusteMetaSemanal");
  if (selMeta) {
    selMeta.value = String(M.leerMeta());
    selMeta.addEventListener("change", () => {
      M.guardarMeta(selMeta.value);
      pintarMeta();
    });
  }

  const chkVoz = document.getElementById("ajusteVoz");
  if (chkVoz) {
    const estado = document.getElementById("ajusteVozEstado");
    if (!V || !V.disponible()) {
      chkVoz.checked = false;
      chkVoz.disabled = true;
      if (estado) estado.textContent = "Este dispositivo no tiene voz disponible";
    } else {
      chkVoz.checked = V.activa();
      chkVoz.addEventListener("change", () => {
        V.fijarActiva(chkVoz.checked);
        if (chkVoz.checked) V.hablar("Voz activada");
      });
    }
  }

  // -----------------------------------------------------
  // Voz
  // -----------------------------------------------------
  const hablar = (t, o) => (V ? V.hablar(t, o) : false);

  const cuenta = document.getElementById("numeroCuenta");
  if (cuenta && V) {
    new MutationObserver(() => {
      const t = cuenta.textContent.trim();
      if (/^[1-9]$/.test(t)) hablar(V.numeroEnPalabras(Number(t)));
      else if (/vamos/i.test(t)) hablar("¡Vamos!");
    }).observe(cuenta, { childList: true, characterData: true, subtree: true });
  }

  // Felicitación al terminar un entrenamiento suelto.
  if (V) {
    new MutationObserver((cambios) => {
      for (const c of cambios) {
        for (const n of c.addedNodes) {
          if (n.id === "celebracionReactiPod") {
            try {
              hablar(`${obtenerFraseFinal().replace(/[¡!]/g, "")}. ${aciertos} aciertos.`);
            } catch (_) {}
          }
        }
      }
    }).observe(document.body, { childList: true });
  }

  // -----------------------------------------------------
  // Compartir
  // -----------------------------------------------------
  const MENSAJES = {
    compartido: ["Resultado compartido.", "exito"],
    whatsapp: ["Se abrió WhatsApp con tu resultado.", "exito"],
    copiado: ["No se pudo abrir WhatsApp: copiamos el resultado para que lo pegues.", "info"],
    error: ["No pudimos compartir el resultado. Inténtalo de nuevo.", "error"],
  };

  async function compartirTexto(texto) {
    const r = await C.compartir(texto, "Mi resultado en RehabPod");
    const m = MENSAJES[r];
    if (m) avisarRehab(m[0], { tipo: m[1] });
    return r;
  }

  const btnCompartir = document.getElementById("btnCompartirResultado");
  if (btnCompartir && C) {
    btnCompartir.addEventListener("click", () => {
      const h = historial();
      const ultima = h[h.length - 1];
      if (!ultima) {
        avisarRehab("Todavía no hay un resultado para compartir.", { tipo: "info" });
        return;
      }
      compartirTexto(C.textoResultado({ nombre: perfil().nombre, ...ultima }));
    });
  }

  // -----------------------------------------------------
  // Meta cumplida: se avisa una sola vez por semana
  // -----------------------------------------------------
  function avisarSiMetaCumplida() {
    try {
      const semana = M.estadoSemana(historial(), M.leerMeta());
      if (!semana.cumplida) return;
      if (localStorage.getItem(CLAVE_AVISADA) === semana.claveSemana) return;
      localStorage.setItem(CLAVE_AVISADA, semana.claveSemana);
      setTimeout(() => {
        avisarRehab(`¡Cumpliste tu meta semanal! ${semana.hechos} ${plural(semana.hechos, "día", "días")} entrenados.`, { tipo: "exito", duracion: 6000 });
      }, 1200);
    } catch (_) {}
  }

  const guardarBase = guardarEntrenamiento;
  guardarEntrenamiento = function () {
    const r = guardarBase.apply(this, arguments);
    // Dentro de una rutina se espera al resumen final para no interrumpir.
    if (!(window.rehabAsistente && window.rehabAsistente.estado.activa)) avisarSiMetaCumplida();
    return r;
  };

  // -----------------------------------------------------
  // Aviso si un Pod se desconecta a mitad de un entrenamiento
  // -----------------------------------------------------
  if (typeof podDesconectado === "function") {
    const desconectadoBase = podDesconectado;
    podDesconectado = async function (indice) {
      const r = await desconectadoBase.apply(this, arguments);
      try {
        if (entrenamientoActivo && !rehabModoVirtual) {
          avisarRehab(`El Pod ${Number(indice) + 1} se desconectó. Acércalo al teléfono y vuelve a conectarlo.`, { tipo: "error" });
        }
      } catch (_) {}
      return r;
    };
  }

  // -----------------------------------------------------
  // Rutinas guiadas: voz, compartir y meta
  // -----------------------------------------------------
  document.addEventListener("rehabpod:rutina", (e) => {
    const d = e.detail || {};

    if (d.tipo === "transicion") {
      hablar(
        d.primera
          ? `Prepárate. Ejercicio ${d.numero} de ${d.total}: ${d.ejercicio}.`
          : `Descanso. Siguiente, ejercicio ${d.numero} de ${d.total}: ${d.ejercicio}.`
      );
      return;
    }

    if (d.tipo === "fin") {
      hablar("¡Rutina completada! Buen trabajo.");
      const acciones = document.querySelector("#asisEjecCuerpo .asis-acciones");
      if (acciones && C && !document.getElementById("asisCompartir")) {
        const b = document.createElement("button");
        b.type = "button";
        b.id = "asisCompartir";
        b.className = "boton botonOscuro";
        b.textContent = "Compartir por WhatsApp";
        b.addEventListener("click", () =>
          compartirTexto(C.textoRutina({ nombre: perfil().nombre, racha: M.calcularRacha(historial()).racha, ...d }))
        );
        acciones.insertBefore(b, acciones.children[1] || null);
      }
      avisarSiMetaCumplida();
    }
  });

  try {
    pintarMeta();
  } catch (_) {}

  window.rehabMotivacion = { pintarMeta, avisarSiMetaCumplida };
})();
