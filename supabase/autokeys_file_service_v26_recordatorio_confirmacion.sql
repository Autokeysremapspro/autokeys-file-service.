-- =========================================================
-- AK CLOUD — Recordatorio de confirmación de email (v26)
--
-- Fuga detectada: al enviar el formulario de /register creamos el usuario
-- en Supabase Auth y mandamos el email de confirmación, pero si el taller
-- no lo confirma (le llega a spam, lo cierra sin más...) su solicitud se
-- queda "pendiente" para siempre y nadie vuelve a avisarle. No hay forma
-- de saber quién abandonó el formulario A MEDIAS (no se guarda nada hasta
-- que se envía), así que esto ataca la fuga real y detectable: quien sí
-- envió el formulario pero nunca confirmó su email.
--
-- Solo añade una columna para no mandar el recordatorio más de una vez
-- por solicitud. El envío en sí lo hace un cron de la app
-- (app/api/cron/recordatorio-confirmacion), no esta migración.
-- =========================================================

alter table public.akcloud_solicitudes_distribuidores
  add column if not exists recordatorio_confirmacion_enviado_at timestamptz;
