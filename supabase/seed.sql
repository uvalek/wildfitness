-- ============================================================
--  Wild Fitness — datos semilla (fechas relativas a CURRENT_DATE)
--  Ejecutar sobre el esquema de schema.sql. Reejecutable: limpia antes.
-- ============================================================

-- Limpieza (respeta orden de llaves foráneas)
truncate public.wf_checkins, public.wf_ventas restart identity;
delete from public.wf_socios;
delete from public.wf_productos;

-- Reinicia la secuencia de folios para que el reset sea determinista:
-- los socios se numeran 1001, 1002, … en el orden de este archivo.
alter sequence public.wf_socios_folio_seq restart with 1001;

insert into public.wf_precios_membresia (tipo, precio) values
  ('Semanal', 100), ('Quincenal', 180), ('Mensual', 300), ('Anual', 3000)
on conflict (tipo) do update set precio = excluded.precio;

insert into public.wf_socios (nombre, telefono, tipo_membresia, fecha_inicio, fecha_vencimiento) values
  ('Jesús Herrera Domínguez', '55 1423 8890', 'Mensual', current_date - 34, current_date - 4),
  ('Mariana Ríos Cázares',    '33 2290 5567', 'Semanal', current_date - 12, current_date - 5),
  ('Rodrigo Peña Villalobos', '81 4501 2213', 'Mensual', current_date - 40, current_date - 10),
  ('Valentina Ochoa Salas',   '55 6712 3345', 'Mensual', current_date - 29, current_date + 1),
  ('Diego Fuentes Márquez',   '55 8890 1102', 'Semanal', current_date - 5,  current_date + 2),
  ('Fernanda Aguilar Nava',   '44 3312 7788', 'Mensual', current_date - 27, current_date + 4),
  ('Emiliano Zúñiga Robles',  '55 2201 9934', 'Anual',   current_date - 361, current_date + 5),
  ('Sofía Mendoza Guerra',    '55 7745 6621', 'Anual',   current_date - 120, current_date + 245),
  ('Alejandro Torres Vega',   '33 9987 4410', 'Mensual', current_date - 10, current_date + 20),
  ('Regina Castillo Ponce',   '55 3345 8812', 'Mensual', current_date - 3,  current_date + 27),
  ('Santiago Ramírez León',   '81 2214 6690', 'Anual',   current_date - 60, current_date + 305),
  ('Camila Núñez Bravo',      '55 6690 3321', 'Semanal', current_date - 1,  current_date + 6),
  ('Leonardo Vargas Mejía',   '55 4412 0087', 'Mensual', current_date - 8,  current_date + 22),
  ('Ximena Delgado Rosas',    '33 5567 1123', 'Anual',   current_date - 200, current_date + 165),
  ('Sebastián Cortés Flores', '55 1123 4456', 'Mensual', current_date - 15, current_date + 15),
  ('Andrea Lozano Campos',    '55 8834 2201', 'Semanal', current_date - 2,  current_date + 5),
  ('Mateo Guzmán Ibarra',     '81 3390 7745', 'Anual',   current_date - 95, current_date + 270);

insert into public.wf_productos (nombre, categoria, precio, stock) values
  ('Agua natural 600ml',           'Bebida',     15,  48),
  ('Bebida hidratante Electrolit', 'Bebida',     32,  30),
  ('Energética Monster 473ml',     'Bebida',     42,  24),
  ('Barra de proteína Quest',      'Snack',      55,  18),
  ('Mix de nueces 40g',            'Snack',      28,  5),
  ('Proteína Whey 2lb (choco)',    'Suplemento', 890, 9),
  ('Pre-entreno C4 30 serv',       'Suplemento', 620, 4),
  ('Creatina monohidrato 300g',    'Suplemento', 480, 12),
  ('Gatorade 500ml',               'Bebida',     22,  40),
  ('Galleta proteica 60g',         'Snack',      38,  16);

insert into public.wf_ingresos_mensuales (offset_meses, membresias, tienda) values
  (-5, 48200, 18400), (-4, 51600, 21300), (-3, 46900, 17800),
  (-2, 53400, 24600), (-1, 57100, 22900), (0, 41250, 0)
on conflict (offset_meses) do update
  set membresias = excluded.membresias, tienda = excluded.tienda;

-- Ventas de hoy
insert into public.wf_ventas (producto_id, producto_nombre, cantidad, precio_unitario, total, fecha)
select p.id, p.nombre, v.cantidad, p.precio, p.precio * v.cantidad,
       date_trunc('day', now()) + v.hora
from (values
  ('Bebida hidratante Electrolit', 2, interval '7 hours 45 minutes'),
  ('Barra de proteína Quest',      1, interval '8 hours 20 minutes'),
  ('Agua natural 600ml',           3, interval '9 hours 10 minutes'),
  ('Creatina monohidrato 300g',    1, interval '10 hours 5 minutes')
) as v(nombre, cantidad, hora)
join public.wf_productos p on p.nombre = v.nombre;

-- Visitas de hoy
insert into public.wf_checkins (socio_id, socio_nombre, fecha, membresia_vigente)
select s.id, s.nombre, date_trunc('day', now()) + c.hora, true
from (values
  ('Sofía Mendoza Guerra',  interval '6 hours 32 minutes'),
  ('Santiago Ramírez León', interval '7 hours 15 minutes'),
  ('Alejandro Torres Vega', interval '8 hours 40 minutes'),
  ('Ximena Delgado Rosas',  interval '9 hours 55 minutes')
) as c(nombre, hora)
join public.wf_socios s on s.nombre = c.nombre;
