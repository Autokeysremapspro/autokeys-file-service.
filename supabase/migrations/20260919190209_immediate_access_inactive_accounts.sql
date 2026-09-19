-- AK Cloud: acceso inmediato y limpieza segura de cuentas que nunca se usan.
--
-- Estas columnas quedan NULL en los distribuidores existentes. De esta forma,
-- la suspensión automática solo afecta a las altas creadas por el nuevo flujo
-- y nunca a las cuentas históricas que no tenían seguimiento de acceso.

alter table public.akcloud_distribuidores
  add column if not exists acceso_inmediato_at timestamptz,
  add column if not exists primer_acceso_at timestamptz,
  add column if not exists aviso_inactividad_enviado_at timestamptz,
  add column if not exists desactivada_por_inactividad_at timestamptz;

create index if not exists akcloud_distribuidores_primer_acceso_pendiente_idx
  on public.akcloud_distribuidores (acceso_inmediato_at)
  where acceso_inmediato_at is not null
    and primer_acceso_at is null
    and estado = 'activo';

comment on column public.akcloud_distribuidores.acceso_inmediato_at is
  'Fecha desde la que una cuenta nueva puede entrar sin aprobación manual.';
comment on column public.akcloud_distribuidores.primer_acceso_at is
  'Primer acceso confirmado al portal; impide la suspensión automática por falta de estreno.';
comment on column public.akcloud_distribuidores.aviso_inactividad_enviado_at is
  'Fecha del aviso previo a la suspensión de una cuenta que nunca ha entrado.';
comment on column public.akcloud_distribuidores.desactivada_por_inactividad_at is
  'Marca una suspensión automática reversible al volver a iniciar sesión.';
