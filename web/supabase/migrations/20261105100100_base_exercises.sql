-- Catálogo base y plantillas Free. El entrenador puede editarlos o agregar más.

insert into public.exercises (name, muscle_group, description) values
  ('Sentadilla con barra', 'piernas', 'Barra sobre la espalda alta, pies al ancho de hombros. Baja con la espalda neutra hasta que la cadera quede a la altura de las rodillas o más abajo y sube empujando el piso.'),
  ('Peso muerto', 'espalda', 'Barra pegada a las espinillas, espalda neutra. Empuja el piso con las piernas y extiende la cadera hasta quedar erguido. Baja controlando sin redondear la espalda.'),
  ('Peso muerto rumano', 'piernas', 'Rodillas apenas flexionadas. Lleva la cadera atrás deslizando la barra por los muslos hasta sentir el estiramiento en los isquios y vuelve.'),
  ('Prensa de piernas', 'piernas', 'Pies al ancho de cadera en la plataforma. Baja hasta que las rodillas formen unos 90° sin despegar la zona lumbar del respaldo.'),
  ('Zancadas', 'piernas', 'Da un paso largo y baja hasta que la rodilla de atrás casi toque el piso. Alterna piernas manteniendo el torso erguido.'),
  ('Elevación de talones', 'piernas', 'De pie, sube sobre la punta de los pies lo más alto posible, pausa un segundo arriba y baja lento.'),
  ('Hip thrust', 'piernas', 'Espalda alta apoyada en un banco y barra sobre la cadera. Sube la cadera apretando glúteos hasta alinear torso y muslos.'),
  ('Press de banca', 'pecho', 'Acostado, escápulas juntas y pies firmes. Baja la barra a la parte media del pecho y empuja hasta extender los brazos.'),
  ('Press inclinado con mancuernas', 'pecho', 'Banco a 30-45°. Baja las mancuernas a los lados del pecho y empuja hacia arriba juntándolas levemente.'),
  ('Flexiones', 'pecho', 'Manos un poco más abiertas que los hombros, cuerpo en línea recta. Baja el pecho cerca del piso y empuja.'),
  ('Aperturas con mancuernas', 'pecho', 'Acostado, brazos casi extendidos. Abre los brazos en arco hasta sentir el estiramiento del pecho y vuelve.'),
  ('Dominadas', 'espalda', 'Agarre prono un poco más ancho que los hombros. Sube hasta pasar la barbilla sobre la barra y baja controlado hasta extender los brazos.'),
  ('Jalón al pecho', 'espalda', 'En polea alta, tira de la barra hacia la parte alta del pecho llevando los codos hacia abajo y atrás.'),
  ('Remo con barra', 'espalda', 'Torso inclinado unos 45°, espalda neutra. Lleva la barra hacia el abdomen juntando las escápulas.'),
  ('Remo con mancuerna', 'espalda', 'Rodilla y mano apoyadas en el banco. Lleva la mancuerna hacia la cadera con el codo pegado al cuerpo.'),
  ('Press militar', 'hombros', 'De pie, barra a la altura de las clavículas. Empuja por encima de la cabeza sin arquear la zona lumbar.'),
  ('Elevaciones laterales', 'hombros', 'Mancuernas a los lados, codos apenas flexionados. Sube los brazos hasta la altura de los hombros y baja lento.'),
  ('Curl de bíceps con barra', 'brazos', 'Codos pegados al torso. Flexiona los brazos subiendo la barra sin balancear el cuerpo.'),
  ('Extensión de tríceps en polea', 'brazos', 'Codos fijos a los costados. Extiende los brazos empujando la cuerda o barra hacia abajo.'),
  ('Fondos en paralelas', 'brazos', 'Brazos extendidos sobre las barras. Baja flexionando los codos hasta unos 90° y empuja de vuelta.'),
  ('Plancha', 'core', 'Apoyado en antebrazos y puntas de pies, cuerpo en línea recta. Aprieta abdomen y glúteos y mantén la posición.'),
  ('Crunch abdominal', 'core', 'Acostado con rodillas flexionadas. Despega los hombros del piso contrayendo el abdomen, sin tirar del cuello.');

insert into public.routines (name, description) values
  ('Cuerpo completo, 3 días', 'Para empezar o volver a entrenar: tres sesiones por semana trabajando todo el cuerpo.'),
  ('Torso y pierna, 4 días', 'Para quien ya entrena: torso y pierna alternados, dos veces cada uno por semana.'),
  ('En casa sin equipo', 'Tres sesiones con el peso del cuerpo, sin necesitar gimnasio.');

-- (rutina, ejercicio, día, orden, series, repeticiones, descanso en segundos)
insert into public.routine_items (routine_id, exercise_id, day, position, sets, reps, rest_seconds)
select r.id, e.id, v.day, v.pos, v.sets, v.reps, v.rest
from (values
  ('Cuerpo completo, 3 días', 'Sentadilla con barra', 1, 1, 3, '8-10', 120),
  ('Cuerpo completo, 3 días', 'Press de banca', 1, 2, 3, '8-10', 120),
  ('Cuerpo completo, 3 días', 'Remo con barra', 1, 3, 3, '10', 90),
  ('Cuerpo completo, 3 días', 'Plancha', 1, 4, 3, '30 s', 60),
  ('Cuerpo completo, 3 días', 'Peso muerto rumano', 3, 1, 3, '10', 120),
  ('Cuerpo completo, 3 días', 'Press militar', 3, 2, 3, '8-10', 90),
  ('Cuerpo completo, 3 días', 'Jalón al pecho', 3, 3, 3, '10-12', 90),
  ('Cuerpo completo, 3 días', 'Crunch abdominal', 3, 4, 3, '15', 60),
  ('Cuerpo completo, 3 días', 'Prensa de piernas', 5, 1, 3, '12', 90),
  ('Cuerpo completo, 3 días', 'Press inclinado con mancuernas', 5, 2, 3, '10', 90),
  ('Cuerpo completo, 3 días', 'Remo con mancuerna', 5, 3, 3, '10', 90),
  ('Cuerpo completo, 3 días', 'Elevación de talones', 5, 4, 3, '15', 60),

  ('Torso y pierna, 4 días', 'Press de banca', 1, 1, 4, '6-8', 150),
  ('Torso y pierna, 4 días', 'Remo con barra', 1, 2, 4, '6-8', 150),
  ('Torso y pierna, 4 días', 'Press militar', 1, 3, 3, '8-10', 120),
  ('Torso y pierna, 4 días', 'Curl de bíceps con barra', 1, 4, 3, '10-12', 60),
  ('Torso y pierna, 4 días', 'Extensión de tríceps en polea', 1, 5, 3, '10-12', 60),
  ('Torso y pierna, 4 días', 'Sentadilla con barra', 2, 1, 4, '6-8', 180),
  ('Torso y pierna, 4 días', 'Peso muerto rumano', 2, 2, 3, '8-10', 120),
  ('Torso y pierna, 4 días', 'Zancadas', 2, 3, 3, '10', 90),
  ('Torso y pierna, 4 días', 'Elevación de talones', 2, 4, 4, '12-15', 60),
  ('Torso y pierna, 4 días', 'Press inclinado con mancuernas', 4, 1, 4, '8-10', 120),
  ('Torso y pierna, 4 días', 'Dominadas', 4, 2, 4, 'al fallo', 120),
  ('Torso y pierna, 4 días', 'Elevaciones laterales', 4, 3, 3, '12-15', 60),
  ('Torso y pierna, 4 días', 'Fondos en paralelas', 4, 4, 3, '8-12', 90),
  ('Torso y pierna, 4 días', 'Peso muerto', 5, 1, 3, '5', 180),
  ('Torso y pierna, 4 días', 'Prensa de piernas', 5, 2, 3, '10-12', 120),
  ('Torso y pierna, 4 días', 'Hip thrust', 5, 3, 3, '10', 90),
  ('Torso y pierna, 4 días', 'Plancha', 5, 4, 3, '45 s', 60),

  ('En casa sin equipo', 'Flexiones', 1, 1, 4, 'al fallo', 90),
  ('En casa sin equipo', 'Zancadas', 1, 2, 3, '12', 60),
  ('En casa sin equipo', 'Plancha', 1, 3, 3, '30 s', 60),
  ('En casa sin equipo', 'Zancadas', 3, 1, 4, '15', 60),
  ('En casa sin equipo', 'Elevación de talones', 3, 2, 3, '20', 45),
  ('En casa sin equipo', 'Crunch abdominal', 3, 3, 3, '20', 45),
  ('En casa sin equipo', 'Flexiones', 5, 1, 3, 'al fallo', 90),
  ('En casa sin equipo', 'Hip thrust', 5, 2, 3, '15', 60),
  ('En casa sin equipo', 'Plancha', 5, 3, 3, '45 s', 60)
) as v(routine, exercise, day, pos, sets, reps, rest)
join public.routines r on r.name = v.routine and r.student_id is null
join public.exercises e on e.name = v.exercise;
