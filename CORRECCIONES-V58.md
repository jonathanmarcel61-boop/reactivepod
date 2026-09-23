# RehabPod V58 — nueve correcciones antes de `main`

1. **Android recuperado:** se regeneró y se incluyó el proyecto Gradle completo.
2. **Identidad RehabPod:** `com.rehabpod.app` y nombre visible RehabPod. Los nombres BLE
   ReactiPod se conservan temporalmente para mantener compatibilidad con los cuatro pods.
3. **Roles protegidos:** una cuenta nueva es usuario y no puede promocionarse desde el cliente.
4. **Supabase endurecido:** migración para RLS, cierre de acceso anónimo y protección de
   `role`, `user_id` y `user_code`.
5. **Servidor protegido:** escucha solo en localhost por defecto; al exponerlo exige token,
   limita clientes, tamaño/frecuencia de mensajes, podId y colores.
6. **Dependencia segura:** Supabase JS está fijado en 2.57.4 e incluido localmente, sin CDN.
7. **Autenticación mejorada:** contraseña de 10+ caracteres con mayúscula, minúscula y número;
   instrucciones para CAPTCHA, correo confirmado y límites en Supabase.
8. **Web/Android endurecidos:** CSP, Helmet, sin HTTP en texto claro, sin copia de seguridad
   Android y reducción/obfuscación del APK release.
9. **Calidad y mantenimiento:** pruebas nuevas de seguridad, scripts de verificación,
   pruebas E2E corregidas y guía de fusión.

## Verificación realizada

- 127 pruebas unitarias aprobadas.
- 145 pruebas E2E aprobaron en la corrida completa; cuatro pruebas tenían un selector antiguo.
- Tras corregir el selector, el grupo afectado terminó con 20 aprobadas y 1 omitida prevista.
- Auditoría de dependencias de producción: 0 vulnerabilidades.
- Capacitor sincronizó correctamente los cuatro plugins Android.
- La compilación Gradle debe ejecutarse en Android Studio: el entorno de auditoría no tuvo
  acceso a `services.gradle.org` para descargar Gradle.
