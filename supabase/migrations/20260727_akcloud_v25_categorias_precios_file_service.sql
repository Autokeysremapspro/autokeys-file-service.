-- =========================================================
-- AK CLOUD — Catálogo por categorías + precio por archivo (v25)
--
-- Contexto: se decide dejar de vender por planes de suscripción
-- y cobrar únicamente precio por archivo (pago por pedido, ya
-- soportado desde v24). El catálogo de servicios pasa a organizarse
-- en 5 categorías de negocio: coches, motos, agricola, camion,
-- especiales (IMMO OFF, airbag crash data, corrección de km...).
--
-- Como aún no hay distribuidores reales enganchados a un catálogo
-- (mismo caso que se documentó en v18), es seguro reemplazar los
-- servicios existentes en vez de solo añadir encima.
-- =========================================================

-- 1) Vaciar el catálogo actual. on delete cascade en
--    akcloud_plan_servicios limpia también las referencias a planes,
--    que de todas formas se están retirando de este modelo.
delete from public.akcloud_servicios;

-- 2) Insertar el catálogo nuevo, con categoria en minúsculas
--    (coches | motos | agricola | camion | especiales) para que
--    coincida 1:1 con las familias del frontend (ver
--    lib/services/akCloudConfig.ts).
insert into public.akcloud_servicios
  (nombre, slug, categoria, descripcion, precio, creditos, icono, orden, activo)
values
  -- --- COCHES ---
  ('Stage 1', 'stage-1-coche', 'coches', 'Optimización de potencia segura para uso diario.', 35, 35, '🚀', 10, true),
  ('Stage 2', 'stage-2-coche', 'coches', 'Calibración avanzada para vehículos con hardware modificado.', 55, 55, '🏁', 20, true),
  ('DPF OFF', 'dpf-off-coche', 'coches', 'Solución para sistema DPF según solicitud del profesional.', 30, 30, '🚫', 30, true),
  ('EGR OFF', 'egr-off-coche', 'coches', 'Solución para sistema EGR según solicitud del profesional.', 30, 30, '🌿', 40, true),
  ('AdBlue OFF', 'adblue-off-coche', 'coches', 'Solución SCR / AdBlue.', 30, 30, '💧', 50, true),
  ('Decat', 'decat-coche', 'coches', 'Eliminación lógica del catalizador según solicitud.', 25, 25, '⚠️', 60, true),
  ('Pops & Bangs', 'pops-bangs-coche', 'coches', 'Configuración de petardeo bajo solicitud.', 20, 20, '💥', 70, true),
  ('Hardcut', 'hardcut-coche', 'coches', 'Limitador tipo hardcut según configuración solicitada.', 20, 20, '🍿', 80, true),
  ('Launch Control', 'launch-control-coche', 'coches', 'Salida asistida bajo configuración técnica.', 25, 25, '🏁', 90, true),
  ('Reset adaptaciones DSG', 'dsg-reset-coche', 'coches', 'Reset de adaptaciones de caja DSG bajo solicitud.', 30, 30, '⚙️', 100, true),

  -- --- MOTOS ---
  ('Stage 1', 'stage-1-moto', 'motos', 'Optimización de potencia segura para moto.', 25, 25, '🚀', 110, true),
  ('Quickshifter / Limitador OFF', 'quickshifter-limitador-off-moto', 'motos', 'Configuración de quickshifter o eliminación de limitador según solicitud.', 20, 20, '⚙️', 120, true),
  ('DPF/EGR/AdBlue OFF', 'anulaciones-off-moto', 'motos', 'Solución para sistemas DPF/EGR/AdBlue en motos que lo incorporan.', 25, 25, '🚫', 130, true),

  -- --- AGRÍCOLA ---
  ('Stage 1', 'stage-1-agricola', 'agricola', 'Optimización de potencia para maquinaria agrícola.', 150, 150, '🚜', 140, true),
  ('Stage 2', 'stage-2-agricola', 'agricola', 'Calibración avanzada para maquinaria agrícola.', 200, 200, '🚜', 150, true),
  ('DPF/EGR/AdBlue OFF', 'anulaciones-off-agricola', 'agricola', 'Solución para sistemas DPF/EGR/AdBlue en maquinaria agrícola.', 80, 80, '🚫', 160, true),

  -- --- CAMIÓN ---
  ('Stage 1', 'stage-1-camion', 'camion', 'Optimización de potencia para vehículo pesado.', 180, 180, '🚛', 170, true),
  ('Stage 2', 'stage-2-camion', 'camion', 'Calibración avanzada para vehículo pesado.', 230, 230, '🚛', 180, true),
  ('DPF/EGR/AdBlue OFF', 'anulaciones-off-camion', 'camion', 'Solución para sistemas DPF/EGR/AdBlue en vehículo pesado.', 90, 90, '🚫', 190, true),
  ('Decat', 'decat-camion', 'camion', 'Eliminación lógica del catalizador en vehículo pesado.', 70, 70, '⚠️', 200, true),

  -- --- SERVICIOS ESPECIALES (transversal, precio distinto según vehículo) ---
  ('IMMO OFF (coche / moto)', 'immo-off-ligero', 'especiales', 'Solución inmovilizador estándar para coche o moto, vía archivo.', 90, 90, '🔑', 210, true),
  ('IMMO OFF (camión / agrícola)', 'immo-off-pesado', 'especiales', 'Solución inmovilizador estándar para vehículo pesado o agrícola, vía archivo.', 180, 180, '🔑', 220, true),
  ('IMMO OFF MD1MG1 (coche / moto)', 'immo-off-md1mg1-ligero', 'especiales', 'Solución inmovilizador de máxima dificultad para coche o moto.', 150, 150, '🔐', 230, true),
  ('IMMO OFF MD1MG1 (camión / agrícola)', 'immo-off-md1mg1-pesado', 'especiales', 'Solución inmovilizador de máxima dificultad para vehículo pesado o agrícola.', 250, 250, '🔐', 240, true),
  ('Airbag crash data (coche / moto)', 'airbag-crash-data-ligero', 'especiales', 'Reset de datos de colisión de airbag para coche o moto, vía archivo.', 70, 70, '🛟', 250, true),
  ('Airbag crash data (camión / agrícola)', 'airbag-crash-data-pesado', 'especiales', 'Reset de datos de colisión de airbag para vehículo pesado o agrícola.', 120, 120, '🛟', 260, true),
  ('Corrección de kilometraje', 'correccion-kilometraje', 'especiales', 'Corrección de kilometraje vía archivo. El profesional es responsable de cumplir la normativa aplicable al usar este servicio.', 60, 60, '📟', 270, true);

notify pgrst, 'reload schema';
