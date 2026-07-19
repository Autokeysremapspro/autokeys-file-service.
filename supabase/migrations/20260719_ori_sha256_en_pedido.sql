-- Guarda la huella (SHA-256) del archivo ORI ya en el momento en que el
-- distribuidor lo sube, en vez de que el laboratorio tenga que descargarlo
-- y volver a calcularla más tarde para poder "enseñarlo" al detector.
alter table public.file_service_pedidos
  add column if not exists ori_sha256 text;

create index if not exists idx_file_service_pedidos_ori_sha256
  on public.file_service_pedidos (ori_sha256);
