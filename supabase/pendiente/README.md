# Cuenta única: cambio pendiente de aprobación

El código de la app retira la interfaz profesional. Este SQL todavía NO se ha aplicado al proyecto de Supabase.

El cambio propuesto convierte la cuenta profesional existente a usuario normal, conserva cuentas, rutinas, sesiones y respaldos, deshabilita el acceso desde la app a las tablas antiguas de vinculación/asignaciones/notificaciones/biblioteca, retira la ejecución de sus funciones y limita las tablas de perfiles e históricos al propietario. El registro de cuentas nuevas usa un trigger privado que fija el rol en usuario.

Las tablas antiguas se conservan como archivo inaccesible desde la app. No se eliminan cuentas ni registros. La revisión automática rechazó aplicar el cambio porque modifica permisos compartidos y requiere aprobación explícita de ese alcance.

Antes de aplicar: comprobar los recuentos e históricos actuales y guardar un respaldo del proyecto. Después: comprobar registro, lectura/actualización de perfil propio, rechazo de acceso a otros usuarios y respaldo/restauración.
