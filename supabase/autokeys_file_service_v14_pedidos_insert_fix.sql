-- =========================================================
-- AK CLOUD — Cierra el hueco de creación directa de pedidos (v14)
-- Con /api/pedidos/crear ya calculando precio y descontando
-- créditos en el servidor, la política que permitía insertar
-- directamente en file_service_pedidos desde el navegador
-- (auth.uid() = user_id) se convierte en una puerta trasera:
-- alguien podría seguir creando pedidos gratis saltándose la API,
-- insertando directo con Supabase.js y un precio inventado.
-- Ejecutar después de v10.
-- =========================================================

drop policy if exists "pedidos_insert_own" on public.file_service_pedidos;

-- Ya no existe política de INSERT para "authenticated" en esta tabla:
-- solo puede insertar el service_role (que usa /api/pedidos/crear),
-- o is_staff() para casos de gestión manual desde el panel admin.
create policy "pedidos_insert_staff" on public.file_service_pedidos
  for insert with check (is_staff());
