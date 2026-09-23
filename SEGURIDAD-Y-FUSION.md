# RehabPod — seguridad y paso de `dev` a `main`

## Antes de probar

1. Ejecuta `npm install`.
2. Ejecuta `npx cap sync android`.
3. Abre Android con `npx cap open android`.
4. En Android Studio usa **Embedded JDK** y espera la sincronización Gradle.

## Supabase (obligatorio antes de producción)

1. Haz una copia de seguridad del proyecto Supabase.
2. Ejecuta `supabase/seguridad-produccion.sql` en SQL Editor.
3. Revisa el resultado de la consulta final: toda tabla `rehab_*` debe tener RLS.
4. En **Authentication → Providers → Email** configura:
   - contraseña mínima de 10 caracteres;
   - confirmación de correo;
   - protección contra contraseñas filtradas, si está disponible;
   - CAPTCHA (Cloudflare Turnstile o hCaptcha);
   - límites de envío e intentos adecuados.
5. Una cuenta nueva siempre es `user`. Para aprobar un profesional, un administrador
   debe cambiar `rehab_profiles.role` desde SQL Editor después de verificarlo.

Ejemplo administrativo:

```sql
update public.rehab_profiles
set role = 'professional', specialty = 'physiotherapy'
where user_id = 'UUID_VERIFICADO';
```

Nunca incluyas una `service_role` o `sb_secret_...` dentro de `public/`.

## Pruebas

```powershell
npm run check
npm run test:unit
npx playwright install chromium
npm run test:e2e
npm run security:audit
```

## Fusión segura

No copies archivos sueltos sobre `main`. Conserva primero una copia o un commit de
tu trabajo y fusiona la rama completa:

```powershell
git switch dev
git add .
git commit -m "Seguridad, Android y optimización antes de main"
git push origin dev
git switch main
git pull origin main
git merge --no-ff dev
git push origin main
```

Si Git informa conflictos, no continúes hasta revisarlos. La rama `main` debe recibir
exactamente el mismo proyecto Android, web y SQL que fue probado en `dev`.
