create extension if not exists pgcrypto;
create table if not exists ak_ecu_detection_rules (
  id uuid primary key default gen_random_uuid(), fabricante text, ecu text not null, familia text not null, marcas text[] default '{}', vehiculo text, modelo text, motor text, potencia text, anios text, herramientas text[] default '{}', servicios text[] default '{}', patrones text[] default '{}', tamanos integer[] default '{}', notas text, activo boolean not null default true, created_at timestamptz not null default now()
);
create index if not exists idx_ak_ecu_rules_activo on ak_ecu_detection_rules(activo);
create index if not exists idx_ak_ecu_rules_familia on ak_ecu_detection_rules(familia);
create index if not exists idx_ak_ecu_rules_ecu on ak_ecu_detection_rules(ecu);
alter table ak_ecu_detection_rules enable row level security;
drop policy if exists "ak_ecu_rules_select" on ak_ecu_detection_rules; create policy "ak_ecu_rules_select" on ak_ecu_detection_rules for select using (true);
drop policy if exists "ak_ecu_rules_insert" on ak_ecu_detection_rules; create policy "ak_ecu_rules_insert" on ak_ecu_detection_rules for insert with check (true);
drop policy if exists "ak_ecu_rules_update" on ak_ecu_detection_rules; create policy "ak_ecu_rules_update" on ak_ecu_detection_rules for update using (true) with check (true);
drop policy if exists "ak_ecu_rules_delete" on ak_ecu_detection_rules; create policy "ak_ecu_rules_delete" on ak_ecu_detection_rules for delete using (true);
insert into ak_ecu_detection_rules (fabricante, ecu, familia, marcas, vehiculo, motor, potencia, anios, herramientas, servicios, patrones, tamanos, notas)
select * from (values
('Bosch','Bosch EDC17C64','EDC17C64',array['Audi','Volkswagen','SEAT','Skoda'],'VAG 2.0 TDI','2.0 TDI','110-190 CV','2012-2018',array['Magic FLEX','KESS3','Autotuner','CMDFlash','PCMFlash'],array['stage1','stage2','dpf','egr','adblue','hardcut'],array['edc17c64','1037\d{6,}','04l\s*906','audi|vw|volkswagen|seat|skoda'],array[2097152,4194304],'Regla base VAG EDC17C64'),
('Bosch','Bosch EDC17C50','EDC17C50',array['BMW','Mini'],'BMW/MINI Diesel','N47 / B47','116-218 CV','2010-2018',array['Magic FLEX','KESS3','Autotuner','CMDFlash'],array['stage1','stage2','dpf','egr','adblue','hardcut'],array['edc17c50','bmw|mini','n47|b47','0281\d{6,}'],array[2097152,4194304],'Regla base BMW EDC17C50'),
('Bosch','Bosch MD1CS003','MD1CS003',array['Opel','Peugeot','Citroën','Fiat'],'PSA / Opel BlueHDi','1.5 / 1.6 BlueHDi','75-130 CV','2017-2024',array['Magic FLEX','KESS3','Autotuner','PCMFlash'],array['stage1','dpf','egr','adblue'],array['md1cs003','opel|peugeot|citroen|citroën|berlingo|combo|rifter|bluehdi'],array[4194304,8388608],'Regla base MD1CS003'),
('Bosch','Bosch MED17.x','MED17',array['Audi','Volkswagen','SEAT','Skoda'],'VAG TSI/TFSI','TSI / TFSI','122-400 CV','2008-2018',array['Magic FLEX','KESS3','Autotuner','CMDFlash','PCMFlash'],array['stage1','stage2','pops','hardcut'],array['med17','med17\.5','tfsi|tsi|gti|s3|ea888'],array[2097152,4194304],'Regla base MED17')
) as seed(fabricante, ecu, familia, marcas, vehiculo, motor, potencia, anios, herramientas, servicios, patrones, tamanos, notas)
where not exists (select 1 from ak_ecu_detection_rules r where r.ecu = seed.ecu and r.familia = seed.familia);
