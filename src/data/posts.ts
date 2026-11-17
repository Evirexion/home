import type { Post } from "@/types/content";
import type { PortableTextBlock } from "@portabletext/types";

/**
 * Wraps text into minimal Portable Text blocks. Paragraphs are separated by a
 * blank line; a paragraph starting with "## " is a subheading, "> " a quote
 * and "- " a bullet line.
 */
function toBlocks(text: string): PortableTextBlock[] {
  return text
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, i) => {
      let style = "normal";
      let content = paragraph;
      const extra: Record<string, unknown> = {};
      if (paragraph.startsWith("## ")) {
        style = "h2";
        content = paragraph.slice(3);
      } else if (paragraph.startsWith("> ")) {
        style = "blockquote";
        content = paragraph.slice(2);
      } else if (paragraph.startsWith("- ")) {
        content = paragraph.slice(2);
        extra.listItem = "bullet";
        extra.level = 1;
      }
      return {
        _type: "block",
        _key: `block-${i}`,
        style,
        ...extra,
        children: [{ _type: "span", _key: `span-${i}`, text: content, marks: [] }],
        markDefs: [],
      } as PortableTextBlock;
    });
}

/**
 * Corriente: the Corriente articles from each magazine edition, newest first —
 * Edición 002 (noviembre 2026), then Edición 001 (octubre 2026) — transcribed
 * from the printed pages. Structure mirrors the `post` document type
 * in /studio, so this can be swapped for a live Sanity query (see lib/posts.ts)
 * without UI changes.
 */
export const mockPosts: Post[] = [
  {
    _id: "corriente-colombia-acelera-4603",
    title: "Colombia acelera hacia lo eléctrico… y el freno podría venir del Congreso",
    slug: "colombia-acelera-4603-electricos-octubre-iva",
    category: "corriente",
    tag: "Mercado",
    excerpt:
      "Octubre dejó 4.603 eléctricos matriculados en un solo mes. Pero mientras los concesionarios celebran, en el Congreso se discute subir el IVA a los eléctricos e híbridos.",
    body: toBlocks(`Octubre dejó una cifra que hace dos años habría sonado a ciencia ficción. Pero mientras los concesionarios celebran, en el Congreso se discute una propuesta que podría cambiar las reglas del juego justo cuando el mercado pisa el acelerador a fondo.

## 150 carros eléctricos al día

Haga la cuenta: en octubre, cada día del mes salieron a las calles colombianas unos 150 carros eléctricos nuevos. En total fueron 4.603 matrículas en un solo mes, según el informe del sector automotor de Fenalco y la Andi con datos del Runt.

Eso es más del doble que en octubre de 2025: un salto del 120,2 %. Y no es un mes aislado. Es la confirmación de una tendencia que ya no tiene reversa.

## El año en que todo cambió

Entre enero y octubre, Colombia ya suma 44.387 vehículos eléctricos matriculados. La cifra triplica lo registrado en el mismo periodo del año anterior, con un crecimiento del 207 %. Y todavía faltan noviembre y diciembre, tradicionalmente dos de los meses más fuertes para la venta de carros en el país.

- 4.603: eléctricos matriculados en octubre de 2026

- +120,2 %: frente a octubre de 2025

- 44.387: eléctricos matriculados entre enero y octubre

- +207 %: crecimiento enero–octubre

## ¿Quién va ganando la carrera?

El trono tiene dueño: Tesla. Su Model Y supera las 15.000 unidades en lo corrido del año. Dicho de otra forma: aproximadamente uno de cada tres carros eléctricos nuevos que ruedan hoy en Colombia lleva su logo.

> 1 de cada 3 carros eléctricos nuevos en Colombia es un Tesla Model Y.

Pero la pelea está lejos de terminar. BYD le respira en la nuca con referencias como el Yuan UP y el Yuan Plus, que han conquistado a quienes buscan dar el salto eléctrico sin disparar el presupuesto. Detrás aparecen MG y Chery, marcas que llegaron sin hacer ruido y hoy ocupan un lugar firme en la conversación.

## La nube negra: el IVA

Aquí es donde la historia da un giro. Mientras las cifras rompen récords, la propuesta de Ley de Rescate plantea subir el IVA a los vehículos eléctricos e híbridos. Una medida que, de aprobarse, encarecería justo el tipo de carro que más está creciendo en el país.

El sector ya encendió las alarmas. La gran pregunta es qué pasará en 2027: ¿seguirá la curva hacia arriba o veremos el primer frenazo de la movilidad eléctrica en Colombia?

## Y usted: elija su favorito

Imagine que mañana firma la compra de su primer carro eléctrico. ¿A quién le entregaría la llave?

- Tesla: el líder indiscutible… pero ¿paga usted por el carro o por el logo?

- BYD: más carro por menos plata. ¿Le alcanzará para destronar al rey?

- MG: la apuesta que llegó en silencio. ¿Sorpresa del año?

- Chery: ¿la opción inteligente que nadie está mirando?

- ¿Otra? Tal vez la suya todavía no aparece en este ranking.

En E-virexion seguiremos de cerca cada cifra, cada lanzamiento y cada debate en el Congreso. Porque la revolución eléctrica en Colombia ya no es una promesa: está pasando ahora, y apenas va en el primer cambio.

Fuente de datos: Informe del sector automotor de octubre de 2026, Fenalco y Andi, con base en el Runt.`),
    author: "E-Virexion",
    publishedAt: "2026-11-17",
    status: "published",
  },
  {
    _id: "corriente-expo-2r-2026",
    title: "Expo 2R 2026: lo que encontramos en el lado eléctrico de Corferias",
    slug: "expo-2r-2026-lado-electrico-corferias",
    category: "corriente",
    tag: "Evento",
    excerpt:
      "Fuimos a la Expo 2R esperando ver motos. Salimos con una pregunta que todavía no nos deja tranquilos: ¿cuánto falta para que la moto a gasolina se vuelva la rareza en la calle?",
    body: toBlocks(`Fuimos a la Expo 2R esperando ver motos. Salimos con una pregunta que todavía no nos deja tranquilos: ¿cuánto falta para que la moto a gasolina se vuelva la rareza en la calle?

Del 29 de octubre al 1 de noviembre, Corferias se llenó de cascos, chaquetas y miles de visitantes. La feria tuvo de todo: pista deportiva, test ride a combustión, clubes moteros. Pero hubo un pabellón entero, el Pabellón 4, dedicado a la movilidad alternativa. Y ahí fue donde pasó lo más interesante.

## Una moto de policía que carga en 30 minutos

La primera parada nos detuvo en seco. En el stand de Vmoto, una moto eléctrica con sirena, baúl y colores de policía nos recibió con las luces encendidas. Es la Stash, y su mensaje era directo: cargador rápido, del 0 al 80 % en 30 minutos, según anunciaba la marca en su stand.

Si una moto eléctrica ya puede patrullar, ¿qué excusa nos queda a los demás?

## El regreso de lo retro… pero sin gasolina

Si algo dejó claro la feria es que lo eléctrico ya no tiene que verse futurista. Mobulaa, que llegó como patrocinador oficial de Millonarios F.C., montó uno de los stands más vistosos, con scooters de líneas clásicas, faros redondos y asientos tapizados que parecen salidos de otra época.

iGoma jugó la misma carta con su línea Pandora: scooters en tonos pastel con aire vintage. Y, para quien quiere algo más deportivo, en el mismo stand estaban la GTR y la RS100.

## Bicicletas con alma de moto

En el stand de Profat las protagonistas no fueron las motos sino las bicicletas eléctricas de llanta ancha. La EON-XR, con suspensión dorada y estética de moto de enduro, fue de las más fotografiadas.

Es una categoría que está creciendo rápido entre quienes buscan moverse por la ciudad sin licencia de moto y sin tráfico de por medio.

## La guerra de precios ya empezó

Aquí es donde la feria se puso seria. Varias marcas llegaron con descuentos y financiación a la vista de todos.

En Evobike, la Águila Pro pasaba de $4.120.000 a $3.708.000, y el stand invitaba a participar por una moto. Al lado, Roadmaster desplegó una pared completa de modelos (City, Águila Ninja, Urban 500 y la patineta Spider), e incluso motos eléctricas para niños.

Ecomobility ofrecía financiación para llevarse la moto el mismo día, y Legacy Motors lanzó la pregunta más provocadora de toda la feria en su pendón.

> "¿Todas las motos eléctricas son iguales?" Spoiler: no. Y esa es justamente la decisión difícil para el comprador.

## E-Virexion también estuvo ahí

En medio del movimiento, Vivian Gómez, de E-virexion, fue entrevistada por Fox Erider a la entrada del pabellón. Hablaron de la movilidad eléctrica en Colombia y de nuestra revista, que Vivian tenía en sus manos durante la conversación.

Estar en la Expo 2R no fue solo cubrir una feria. Fue confirmar que la conversación sobre movilidad eléctrica ya se tomó la calle.

## La pregunta que nos llevamos a casa

Recorrimos los stands, vimos precios, probamos sillines y escuchamos a vendedores y visitantes. Y salimos con la sensación de que la próxima Expo 2R podría verse muy distinta: con más pabellones eléctricos que de combustión.

¿Exageramos? Tal vez. Pero si usted estuvo en Corferias, ya sabe de qué hablamos.

Fotos: Revista E-virexion, Expo 2R 2026, Corferias, Bogotá.`),
    author: "E-Virexion",
    publishedAt: "2026-11-17",
    status: "published",
  },
  {
    _id: "corriente-mexico-peru",
    title: "México y Perú: dos mercados eléctricos, dos velocidades",
    slug: "mexico-peru-mercados-electricos-dos-velocidades",
    category: "corriente",
    tag: "Región",
    excerpt:
      "En México ya circulan más de un cuarto de millón de vehículos electrificados y el reto ahora es la red eléctrica. En Perú, en nueve meses, el mercado superó todo lo que vendió en 2024 y 2025.",
    body: toBlocks(`En México ya circulan más de un cuarto de millón de vehículos electrificados y el reto ahora es la red eléctrica. En Perú, en apenas nueve meses, el mercado superó todo lo que vendió en 2024 y 2025. Pero hay un dato peruano que sorprende, y no para bien.

## México: más de 81.000 conectables en nueve meses

El Barómetro de Electromovilidad de la Electro Movilidad Asociación (EMA) trae los números más frescos. Entre enero y septiembre de 2026, las marcas asociadas vendieron 81.488 vehículos eléctricos, híbridos conectables y de rango extendido, un 19,3 % más que en el mismo periodo del año pasado.

Solo en el tercer trimestre se comercializaron 28.230 unidades, frente a 24.498 entre julio y septiembre de 2025: un alza del 15,2 %.

- 81.488: eléctricos, híbridos conectables y de rango extendido vendidos en México, ene–sep 2026

- +19,3 %: crecimiento ene–sep frente a 2025

- 62.883: conexiones de recarga en México a septiembre (54.080 un año antes)

## El problema que viene

Con más de 250.000 vehículos electrificados en la calle, la conversación en México cambió de tema. Ya no se trata de vender más carros, sino de si la red eléctrica aguantará la demanda de recarga en las grandes ciudades.

En el foro Latam Mobility 2026, el presidente de la planta de BMW en San Luis Potosí advirtió que el país tiene pendientes en generación y distribución de energía hacia 2030. Además, menos del 10 % de los puntos de carga en México son de acceso público.

Y mientras tanto, la industria se mueve: GAC Motor anunció el inicio de operaciones de su primera planta de ensamble en México durante el segundo semestre de 2026.

## Perú: el año que lo cambió todo

Si México va en velocidad crucero, Perú acaba de pisar el acelerador. Según AEDIVE Perú, entre enero y septiembre de 2026 se registraron 13.285 vehículos electrificados.

Para dimensionarlo: en todo 2024 se vendieron 6.664 y en todo 2025, 10.239. Es decir, en nueve meses Perú ya superó cualquier año anterior completo. Desde 2012, el país acumula 40.216 vehículos electrificados.

- 2024: 6.664

- 2025: 10.239

- Ene–sep 2026: 13.285

El Gobierno también se mueve. El Ministerio de Energía y Minas firmó con Corea del Sur un proyecto piloto para 2026-2028 que incluye la donación de un vehículo eléctrico y dos estaciones de carga alimentadas con energía solar y almacenamiento en baterías.

## El dato que preocupa

Aquí viene la sorpresa: en esos mismos nueve meses, Perú registró apenas tres buses eléctricos. Uno en marzo y dos en agosto.

El boom peruano, por ahora, es de carros particulares. El transporte público, que es donde se mueve la mayoría de la gente, sigue casi intacto.

## Y Colombia…

Mientras México discute cómo reforzar su red y Perú vive su año récord, Colombia ya superó las 44.000 matrículas de carros eléctricos entre enero y octubre, según Fenalco y la Andi. La pregunta es inevitable: ¿quién liderará la carrera eléctrica en Latinoamérica en 2027?

Fuentes: Electro Movilidad Asociación (EMA), Barómetro de Electromovilidad de México, vía El Siglo de Torreón; El Financiero; Latam Mobility 2026, vía Puerto Interior Guanajuato y Pasajero7; AEDIVE Perú, vía Surtidores LATAM (27 de octubre de 2026); Ministerio de Energía y Minas del Perú, vía Agencia Andina (2 de octubre de 2026).`),
    author: "E-Virexion",
    publishedAt: "2026-11-17",
    status: "published",
  },
  {
    _id: "corriente-antes-de-comprar",
    title: "Antes de comprar un eléctrico, nuevo o usado",
    slug: "antes-de-comprar-vehiculo-electrico-nuevo-o-usado",
    category: "corriente",
    tag: "Guía",
    excerpt:
      "En un vehículo eléctrico, la batería y el uso que le va a dar pesan más que el precio de vitrina. Lo que conviene revisar antes de pagar, en concesionario o de segunda mano.",
    body: toBlocks(`En un vehículo eléctrico, la batería y el uso que le va a dar pesan más que el precio de vitrina. Esta guía reúne lo que conviene revisar antes de pagar, tanto si compra en concesionario como si compra de segunda mano.

La oferta de carros, motos, bicicletas y patinetas eléctricas crece cada mes en Colombia, y con ella el mercado de usados. Elegir bien significa revisar cosas que en un vehículo de gasolina no existen: el estado de la batería, la forma de cargar, la garantía del sistema eléctrico y las reglas que aplican a cada tipo de vehículo.

## Primero: ¿qué necesita y cómo lo va a usar?

- ¿Cuántos kilómetros recorre al día? Sume ida, vuelta y algo de margen. La autonomía real suele ser menor que la del catálogo, sobre todo con pendientes, carga pesada o lluvia.

- ¿Dónde va a cargar? En casa, en el edificio, en el trabajo o en estaciones públicas. Si vive en conjunto, confirme con la administración. Los edificios con licencia radicada después de julio de 2019 deben tener acometida para carga, salvo VIS y VIP (Ley 1964 de 2019, art. 10).

- ¿Qué vehículo encaja con su recorrido? Una bicicleta o patineta resuelve trayectos urbanos cortos. Una moto o un carro cubren distancias mayores, pero cambian los papeles, el seguro y la licencia.

## Si compra nuevo

En un vehículo nuevo, la garantía de la batería y el respaldo de servicio técnico valen tanto como la ficha técnica.

- Autonomía real, no de catálogo. Pregunte bajo qué norma se midió y pida una prueba de manejo en su recorrido habitual.

- Carga. Confirme el tipo de conector, cuánto tarda una carga completa en un tomacorriente normal y si el cargador viene incluido.

- Garantía separada para la batería. Pida por escrito cuántos años o kilómetros cubre y desde qué pérdida de capacidad aplica.

- Repuestos y taller. Pregunte dónde se hace el mantenimiento en su ciudad, si hay repuestos en el país y cuánto tarda un pedido. Una marca sin red de servicio puede dejar el vehículo parado semanas.

- Papeles. Exija factura con el número de serie o VIN. En carros y motos, verifique que el vehículo esté homologado y pueda matricularse.

## Beneficios para carros y motos eléctricas (Ley 1964 de 2019)

- Impuesto vehicular: no puede superar el 1 % del valor comercial (art. 3).

- SOAT: descuento del 10 % en la prima (art. 4).

- Revisión técnico-mecánica: descuento en su valor, según reglamentación (art. 4).

- Pico y placa y día sin carro: exentos, salvo restricciones por seguridad (art. 6).

- Parqueaderos: al menos 2 % de cupos preferenciales en parqueaderos públicos y comerciales de ciudades grandes (art. 7).

- IVA: tarifa reducida del 5 % (INCP).

## Si es bicicleta o patineta eléctrica

Desde agosto de 2026 rigen reglas nuevas para los vehículos eléctricos livianos (Resolución 20263040030675 de 2026). Revise en qué categoría queda el modelo, porque de eso depende por dónde puede circular.

- Bicicleta de pedaleo asistido: hasta 1.000 W, sin acelerador autónomo. Ciclorruta, máximo 25 km/h.

- Patineta (VEP): hasta 1.000 W y 25 km/h. Ciclorruta.

- Patineta tipo 2: hasta 1.000 W, puede llegar a 40 km/h. Ciclorruta a 25 km/h; si va más rápido, calzada.

- Por encima de esos límites (más de 1.000 W o más de 40 km/h): solo calzada, como ciclomotor.

Todo vehículo eléctrico liviano de más de 60 kg o más de 40 km/h necesita matrícula, SOAT y licencia. Desde el 1 de enero de 2027 deben llevar una lámina de identificación con marca, modelo, serie, año, peso, potencia, velocidad máxima y categoría. Pida esos datos por escrito.

El casco certificado es obligatorio, y de noche se exigen prendas reflectivas.

## Si compra usado

En un eléctrico usado, el dato que más importa no es el kilometraje sino el estado de salud de la batería (SOH): el porcentaje de capacidad que conserva frente a cuando era nueva. Por encima del 80 % se considera un buen estado.

> SOH mínimo recomendado: 80 %.

- Pida un diagnóstico de la batería. Que lo haga un taller de la marca o un especialista con equipo de diagnóstico, no el vendedor. El informe debe mostrar la capacidad actual frente a la original.

- Verifique la garantía restante. En carros, los fabricantes suelen cubrir la batería hasta 8 años o 160.000 km cuando la capacidad cae por debajo del 70 %. Confirme si sigue vigente y si pasa al nuevo dueño.

- Pregunte cómo se cargaba. El uso frecuente de carga rápida desgasta más las celdas que la carga lenta.

- Revise el historial. Mantenimientos, actualizaciones de software, accidentes y reparaciones. En carros y motos, consulte el RUNT para confirmar dueño, multas, SOAT y que no tenga embargos.

- Desconfíe de modificaciones. Baterías sin marca, controladores reprogramados o cargadores no originales son señales de alerta. En bicicletas y patinetas, un vehículo modificado puede quedar fuera de su categoría legal.

- Revise que vengan los cables y el cargador. Reponerlos puede costar bastante.

- Pruébelo en su recorrido. Mire cuánto baja la batería, escuche ruidos en suspensión y frenos y revise que no haya golpes debajo del vehículo, donde suele ir la batería.

## Lista de chequeo antes de pagar

- La autonomía real cubre mi recorrido diario con margen.

- Sé dónde voy a cargar y tengo permiso si es en un conjunto.

- Tengo por escrito la garantía de la batería.

- Usado: tengo un diagnóstico de la batería hecho por un tercero.

- Bici o patineta: sé su categoría y por dónde puede circular.

- Confirmé dónde se hace el mantenimiento y si hay repuestos.

- Usado: revisé el historial y, en carros y motos, el RUNT.

- Recibí factura o contrato con número de serie o VIN.

Fuentes: Ley 1964 de 2019, Congreso de la República (Minambiente); INCP, Beneficios de contar con carro eléctrico en Colombia; El Carro Colombiano, Nueva reglamentación y Nuevas reglas para patinetas y bicicletas eléctricas; Híbridos y Eléctricos, Consejos para comprar un eléctrico de segunda mano.`),
    author: "E-Virexion",
    publishedAt: "2026-11-17",
    status: "published",
  },
  {
    _id: "corriente-velmpu",
    title: "El día que Colombia le puso nombre y apellido a sus ruedas eléctricas",
    slug: "velmpu-placa-micromovilidad-electrica",
    category: "corriente",
    tag: "Regulación",
    excerpt:
      "Desde el 1 de enero de 2027, patinetas, bicicletas eléctricas y monociclos tendrán que portar una lámina técnica que diga exactamente qué son. Llega la placa VELMPU.",
    body: toBlocks(`Hay una cuenta regresiva corriendo en silencio desde agosto, y casi nadie la está mirando todavía. El 1 de enero de 2027, miles de patinetas, bicicletas eléctricas y monociclos que hoy circulan por Bogotá, Medellín o Cali sin ningún tipo de identificación dejarán de ser objetos anónimos sobre ruedas. Cada uno tendrá que portar una lámina técnica que diga exactamente qué es: marca, modelo, año, potencia, peso, velocidad máxima. Una especie de cédula de ciudadanía para la micromovilidad.

El origen de esa cuenta regresiva es la Resolución 20263040030675, expedida por el Ministerio de Transporte a comienzos de agosto de 2026 para desarrollar la Ley 2486 de 2025. Hasta ahora, la micromovilidad eléctrica colombiana crecía en un terreno sin cercas: cualquier cosa con dos ruedas y un motor pequeño podía subirse a una ciclorruta, a un andén o a una calzada sin que existiera una sola categoría oficial que dijera qué era y qué reglas debía seguir. Esa ambigüedad se acaba.

## Una clasificación que ordena el caos

La norma inaugura algo que Colombia nunca había tenido: una taxonomía oficial de la micromovilidad. Bicicletas eléctricas, patinetas, monociclos, triciclos y el resto de la familia de vehículos personales quedan divididos entre automotores y no automotores, y agrupados bajo una sigla que empezará a sonar cada vez más en la calle: VELMPU, Vehículos Eléctricos Livianos de Movilidad Personal Urbana. No es un capricho burocrático — es la diferencia entre que una autoridad de tránsito pueda o no saber, de un vistazo, si el vehículo que tiene enfrente debe ir por la ciclorruta, por la calzada, o ninguna de las dos.

## Las reglas de la calle, con número exacto

El texto no se queda en clasificar; también dicta cómo se conduce. Casco certificado y ropa reflectiva en condiciones de baja visibilidad. Un tope de 25 km/h en ciclorrutas y espacios recreativos, y de 40 km/h en calzada fuera del perímetro urbano —salvo que el municipio decida bajarlo—. Y una lista de equipamiento mínimo que convierte a estos vehículos, técnicamente, en algo mucho más cercano a un medio de transporte regulado que a un juguete urbano: frenos, luces delanteras y traseras, direccionales, avisador acústico, indicador de batería y velocidad, y un limitador que impida forzar el vehículo más allá de su tope permitido.

## La pieza que todos están llamando "la placa"

Pero si hay un elemento de esta resolución que ya se tomó la conversación pública, es esa lámina de identificación que la prensa bautizó, sin mucha ceremonia, como "la placa". No es una matrícula en el sentido tradicional del automóvil o la moto — es una etiqueta técnica que debe llevar visible el vehículo, y que resume su identidad completa: marca, modelo, año de fabricación, número de serie, peso, potencia, categoría, clase y velocidad máxima.

El alcance sorprende a quien lo revisa con calma: no aplica solo a las patinetas de alquiler que ya todos conocen. Cobija a todo VELMPU, y también a cualquier vehículo eléctrico —con batería incluida— que pese 60 kilogramos o menos, además de los que superen ese peso pero no pasen de 40 km/h de velocidad de fábrica. En la práctica, casi ningún vehículo eléctrico liviano queda por fuera.

## Tres meses para aprender, antes de que empiecen las multas

El Gobierno, consciente de que está introduciendo una obligación completamente nueva, optó por no salir con el garrote primero. Antes de que las sanciones entren a operar, habrá tres meses de pedagogía a cargo de la Agencia Nacional de Seguridad Vial, pensados para que fabricantes, comercializadores y usuarios entiendan la norma antes de tener que cumplirla al pie de la letra.

## Lo que esta norma no toca

Vale la pena decirlo con claridad, porque es la confusión que más se repite: esta resolución no mueve la frontera entre una patineta eléctrica y una motocicleta eléctrica. Si una moto eléctrica tiene la potencia, la velocidad o el diseño de una motocicleta convencional, sigue exigiendo licencia A1, SOAT, matrícula y revisión técnico-mecánica, exactamente igual que una de combustión. El nuevo régimen liviano es, precisamente, para lo que es liviano.

Entre agosto de 2026 y enero de 2027 hay una ventana que el sector eléctrico colombiano no puede dejar pasar: fabricantes que deben empezar a etiquetar, comercializadores que deben explicarle al comprador qué está adquiriendo, y usuarios que tendrán que aprender a leer su propio vehículo como quien lee una hoja de vida. La calle colombiana está a punto de dejar de ser anónima.

E-VIREXION seguirá de cerca la implementación de esta resolución hasta su entrada en vigor.`),
    author: "E-Virexion",
    publishedAt: "2026-10-17",
    status: "published",
  },
  {
    _id: "corriente-bogota-silencio",
    title: "Bogotá rueda en silencio: la capital eléctrica del transporte público",
    slug: "bogota-rueda-en-silencio-transporte-publico-electrico",
    category: "corriente",
    tag: "Movilidad local",
    excerpt:
      "Con más de mil buses de batería contratados, la ciudad tiene la flota eléctrica de transporte público más grande por fuera de China. Ahora el cambio llega a las troncales, con articulados y biarticulados que empezarán a rodar en 2027.",
    body: toBlocks(`Quien espera hoy un bus zonal en Bosa, Usme o Fontibón tiene cada vez más probabilidades de que llegue sin el rugido del motor ni la nube negra del escape. Bogotá dejó de ver la electromovilidad como un plan piloto: hoy es la base de la renovación de su flota.

- 1.485 buses 100 % eléctricos contratados para el sistema.

- 269 eléctricos nuevos para las troncales desde 2027.

- 27 m de largo de los biarticulados, con cupo para 250 personas.

- −21 % de costo de operación frente a buses a gas.

## Una flota que se cuenta por miles

Según TransMilenio, el sistema ya tiene contratados 1.485 buses eléctricos. Con esa cifra, la entidad ubica a Bogotá como la ciudad con más buses de esta tecnología fuera de China, por delante de Santiago de Chile (973) y Ciudad de México (273).

Casi toda esa flota rueda en el componente zonal: los buses azules y verdes que recorren los barrios y llevan pasajeros hacia los portales. Allí el cambio se nota más, porque reemplaza vehículos con más de quince años de servicio.

## 2026, el año de la renovación zonal

El 1 de abril arrancaron los primeros 68 buses eléctricos de la nueva tanda, operados por ETIB. La primera ruta fue la HG543, entre Rincón de Venecia y Porciúncula. Cada bus recorre unos 330 kilómetros con una carga y, juntos, dejan de emitir cerca de 2.628 toneladas de CO₂ al año.

Por dentro también son distintos: tienen wifi, puertos USB, espacios para sillas de ruedas y cámaras que detectan si el conductor tiene sueño o usa el celular mientras maneja.

## Lo que gana el pasajero

- Viajes con mucho menos ruido: la Alcaldía estima entre 27 % y 36 % menos que con un bus diésel.

- Aire más limpio en los barrios, porque el bus no tiene tubo de escape.

- Wifi, cargadores USB y mejor accesibilidad.

- Más mujeres al volante, una de las metas de los nuevos contratos.

## Un bus que sirve en las dos orillas

En agosto, la ciudad presentó 50 articulados eléctricos de tipo dual, un diseño que TransMilenio describe como único en el mundo. Tienen puertas a ambos lados, así que pueden parar en las plataformas altas de las estaciones troncales y también en los paraderos de calle del sistema zonal.

Cada uno lleva hasta 160 personas. Entrarán a operar poco a poco, a medida que la ciudad entregue nuevos corredores como la extensión de la Avenida Ciudad de Cali, que beneficiará sobre todo a Bosa y Kennedy.

## Las troncales se electrifican

El salto más grande llega en 2027. La llamada Fase VI incorpora 269 buses eléctricos BYD para las troncales: 157 articulados de 18 metros, con cupo para unas 160 personas, y 112 biarticulados de 27 metros, con espacio para hasta 250. El contrato lo ganó la sociedad formada por Fanalca y Transdev, que aportará la flota y la infraestructura de carga.

Los primeros 30 vehículos deben llegar a mediados de 2027 y el resto antes de terminar ese año. Rodarán por la extensión de la NQS hacia Soacha, la Avenida Ciudad de Cali y la Avenida 68, y cargarán en los patios de El Vínculo (Soacha) y la Calle Sexta. El patio de El Vínculo tendrá paneles solares para producir parte de su propia energía.

> Con la Fase VI, la flota troncal pasa de 2.203 a 2.472 buses, unos 50.300 cupos más para los pasajeros. (Cifras de TransMilenio S.A.)

La inversión ronda los 1,5 billones de pesos, y la Nación aporta el 62,4 %. TransMilenio calcula que operar estos buses costará 21 % menos que hacerlo con buses a gas natural. También estima que, durante los 15 años del contrato, dejarán de emitir unas 353.760 toneladas de CO₂.

## Hecho (en parte) en Cota

Una parte de la cadena ya está en Colombia. Los buses se ensamblan en la planta de Hino en Cota, Cundinamarca, con chasis importado y carrocería de Superpolo. Solo la flota zonal de 2026 generó más de 1.330 empleos directos en ese municipio.

## Lo que viene: el metro también es eléctrico

La Línea 1 del Metro de Bogotá completará la red de transporte eléctrico. En septiembre de 2026 la obra iba en 83,73 %, y 20 de los 30 trenes ya estaban en el país. Serán 23,9 km y 16 estaciones entre Bosa y la Calle 72 con Avenida Caracas, un viaje de unos 27 minutos. Diez de esas estaciones conectarán directamente con TransMilenio. La operación comercial está prevista para marzo de 2028.

## Línea de tiempo · Bogotá eléctrica

- Abr. 2026 — Arrancan los primeros 68 buses zonales eléctricos de la nueva renovación (ruta HG543).

- Ago. 2026 — Se presentan los 50 articulados duales, con puertas a ambos lados.

- Sep. 2026 — La Línea 1 del Metro llega a 83,73 % de avance y suma 20 trenes en el país.

- 2027 — Llegan los 269 eléctricos BYD de la Fase VI para las troncales del sur.

- Mar. 2028 — Inicio previsto de la operación comercial del Metro de Bogotá.

Fuentes: TransMilenio S.A. (dic. 2025 y ago. 2026), Alcaldía de Bogotá (abr. y sep. 2026), La República (jun. 2025), Colombia.com (jul. 2026), Revista Autos Más (jul. 2026), El Carro Colombiano (feb. 2026).`),
    author: "E-Virexion",
    publishedAt: "2026-10-17",
    status: "published",
  },
  {
    _id: "corriente-mas-alla-de-bogota",
    title: "Más allá de Bogotá: el mapa eléctrico del transporte masivo",
    slug: "mas-alla-de-bogota-mapa-electrico-transporte-masivo",
    category: "corriente",
    tag: "Movilidad nacional",
    excerpt:
      "Medellín apostó por los rieles hace tres décadas, Cali estrena su primera flota pública y Cundinamarca prepara su primer tren eléctrico. Así avanza la electrificación del transporte masivo en el resto del país.",
    body: toBlocks(`Bogotá concentra los titulares, pero no es la única ciudad que se electrifica. Cada región avanza a su manera: unas con buses de batería, otras con trenes, tranvías y cables que funcionan con electricidad desde hace años.

- 41 buses eléctricos en el MIO de Cali.

- +33 eléctricos de la primera flota pública de Cali en 2026.

- 52 % de avance del Metro de la 80 en Medellín.

- 2027, año en que arranca el Regiotram de Occidente.

## Medellín, pionera sobre rieles

La capital antioqueña tiene la red eléctrica de transporte más antigua del país. El Metro, el tranvía de Ayacucho y los metrocables usan electricidad desde que empezaron a operar, y a eso se sumó en 2019 una compra de 64 buses eléctricos para Metroplús y sus rutas alimentadoras, con unos 300 km de autonomía cada uno.

La próxima gran obra es el Metro de la 80, un metro ligero eléctrico de 13,25 km por la avenida del mismo nombre. A mediados de 2026 superaba el 52 % de avance. Podrá mover hasta 14.000 pasajeros por hora en cada sentido, y en San Germán tendrá la primera estación subterránea de un sistema férreo en Colombia. Se espera que empiece a operar por etapas a comienzos de 2029.

## Cali estrena flota propia

El MIO suma 41 buses eléctricos: 35 busetones y 6 articulados. Los últimos cinco articulados empezaron a rodar el 23 de septiembre de 2026. Miden 18 metros, llevan hasta 160 pasajeros, tienen aire acondicionado y puertos USB, y se cargan en unas tres horas.

Lo más novedoso viene antes de que termine el año: 45 buses más llegarán como la primera flota de propiedad pública del sistema. De ellos, 33 serán eléctricos y 12 diésel con norma Euro VI.

- Rieles primero: los sistemas sobre rieles y cables, como el metro, el tranvía y los cables aéreos, funcionan con electricidad desde que se diseñan. Por eso Medellín empezó con ventaja.

- Buses a batería: en las ciudades donde el transporte masivo va por la calle, como Bogotá y Cali, cambiar el diésel por baterías es la forma más rápida de reducir emisiones.

- Más allá de las capitales: las ciudades intermedias aún hacen pruebas o planes de renovación. Su avance dependerá de la financiación y de tener dónde cargar.

## Cundinamarca: un tren eléctrico para la Sabana

El Regiotram de Occidente unirá Facatativá, Madrid, Mosquera y Funza con Bogotá. La primera fase va de Facatativá a Fontibón: 26 kilómetros y 17 estaciones. Los 16 trenes, fabricados por CRRC en China, llevarán hasta 964 personas cada uno.

Las pruebas están previstas para comienzos de 2027 y la operación para el segundo semestre de ese año. El recorrido completo hasta la Calle 26, en Bogotá, llegaría en 2029, con más de 140.000 pasajeros al día.

## Pereira, Barranquilla y Bucaramanga

En Pereira, el Megacable conecta la ciudad con Dosquebradas por aire, con un sistema eléctrico de cabinas integrado a Megabús.

En Barranquilla, el Área Metropolitana presentó un plan para renovar los buses urbanos que incluye 150 vehículos nuevos (la entidad los ha descrito a veces como eléctricos y otras como eléctricos y a gas). Ya se probaron dos buses eléctricos.

Bucaramanga hizo en 2021 una prueba de seis meses con un articulado eléctrico que le prestó TransMilenio. Ese ensayo dejó datos útiles para planear una futura flota de Metrolínea.

## La industria se mueve con la demanda

El crecimiento también se nota en la producción. BYD prevé sumar en 2026 más de 200 buses eléctricos al país, sobre todo en Bogotá y Cali, y llevar después su oferta a Medellín y Pereira. Los arma en Cota con apoyo de Hino, en tamaños de 50, 80 y 160 pasajeros.

## Qué es eléctrico hoy y lo que viene

- Bogotá (TransMilenio · SITP): 1.485 buses eléctricos contratados. Lo que viene: 269 troncales (2027) y Metro L1 (2028).

- Medellín (Metro · Metroplús): metro, tranvía, metrocables y 64 buses. Lo que viene: Metro de la 80 (desde 2029).

- Cali (MIO): 41 buses (35 busetones, 6 articulados). Lo que viene: 33 eléctricos de la flota pública (2026).

- Sabana de Bogotá (Regiotram de Occidente): en construcción. Lo que viene: Fase 1 Facatativá–Fontibón (2027).

- Pereira (Megabús · Megacable): cable aéreo eléctrico. Lo que viene: llegada prevista de buses eléctricos BYD.

- Barranquilla (Área Metropolitana): 2 buses eléctricos de prueba. Lo que viene: renovación con 150 buses nuevos.

Fuentes: Metro Cali y Portafolio (sep. 2026), Infobae (jun. 2026), El Colombiano y Noticias RCN (2019–2020), Gobernación de Cundinamarca, Área Metropolitana de Barranquilla (2024–2025), El Carro Colombiano (2021 y feb. 2026), TransMilenio S.A.`),
    author: "E-Virexion",
    publishedAt: "2026-10-17",
    status: "published",
  },
  {
    _id: "corriente-33889-razones",
    title: "33.889 razones para creer en lo que viene",
    slug: "33889-razones-matriculas-electricas-2026",
    category: "corriente",
    tag: "Mercado",
    excerpt:
      "Colombia ya no pregunta si la movilidad eléctrica llegará. La pregunta quedó atrás. Lo que queda es la velocidad a la que está pasando: matrículas eléctricas +222,5 %.",
    body: toBlocks(`Colombia ya no pregunta si la movilidad eléctrica llegará. La pregunta quedó atrás. Lo que queda es la velocidad a la que está pasando.

222,5 %. Ese es el salto que registran las matrículas eléctricas entre enero y agosto de 2026 frente al mismo periodo del año anterior — 33.889 vehículos que ya no son excepción, sino evidencia. Solo en agosto, 4.542 unidades más se sumaron a las calles del país, un 176 % por encima de hace un año.

Los números de Fenalco y la ANDI no cuentan una tendencia. Cuentan un cambio de era.

Y mientras la curva sube, la infraestructura responde: puntos de carga gratuita recorriendo el territorio, rumbo a Bogotá para cerrar el año — la misma ciudad, el mismo mes, donde E-VIREXION enciende su propio motor.

## Matrículas de vehículos eléctricos, enero–agosto

- 2025: 10.508

- 2026: 33.889 (+222,5 %)

> 1 de cada 6 vehículos nuevos matriculados en 2026 ya es 100 % eléctrico. Hace un año era 1 de cada 14.

Fuente: Fenalco y ANDI con datos del RUNT. Agosto: 4.542 unidades (+176 % frente a 1.647 en agosto de 2025).`),
    author: "E-Virexion",
    publishedAt: "2026-10-17",
    status: "published",
  },
  {
    _id: "innov-1",
    title: "Baterías de estado sólido: la promesa que podría duplicar la autonomía",
    slug: "baterias-estado-solido-autonomia",
    category: "innovations",
    tag: "Tecnología de baterías",
    excerpt:
      "Fabricantes asiáticos aceleran la producción piloto de celdas de estado sólido, prometiendo autonomías superiores a 800 km.",
    body: toBlocks(
      "Fabricantes asiáticos aceleran la producción piloto de celdas de estado sólido, prometiendo autonomías superiores a 800 km y tiempos de carga bajo 10 minutos.\n\nAnalistas anticipan su llegada comercial a Latinoamérica hacia 2029."
    ),
    author: "Redacción E-VIREXION",
    publishedAt: "2026-07-12",
    status: "published",
  },
  {
    _id: "innov-2",
    title: "Carga bidireccional V2H: cómo tu carro puede alimentar tu casa",
    slug: "carga-bidireccional-v2h-colombia",
    category: "innovations",
    tag: "Vehicle-to-Home",
    excerpt:
      "La tecnología V2H permite usar la batería del vehículo como respaldo energético durante cortes de luz, un caso de uso clave en zonas con red inestable.",
    body: toBlocks(
      "La tecnología V2H permite usar la batería del vehículo como respaldo energético durante cortes de luz, un caso de uso clave en zonas con red inestable.\n\nLos primeros pilotos en Colombia arrancarán en Barranquilla y Cali este año."
    ),
    author: "Redacción E-VIREXION",
    publishedAt: "2026-07-02",
    status: "published",
  },
  {
    _id: "innov-3",
    title: "Inteligencia artificial optimiza rutas de flotas eléctricas de reparto",
    slug: "ia-rutas-flotas-electricas-reparto",
    category: "innovations",
    tag: "Software y datos",
    excerpt:
      "Startups colombianas desarrollan algoritmos que combinan clima, tráfico y nivel de batería para maximizar la eficiencia de flotas EV.",
    body: toBlocks(
      "Startups colombianas desarrollan algoritmos que combinan clima, tráfico y nivel de batería para maximizar la eficiencia de flotas EV.\n\nLas primeras pruebas muestran ahorros de hasta 22% en consumo energético por ruta."
    ),
    author: "Redacción E-VIREXION",
    publishedAt: "2026-06-20",
    status: "published",
  },
  {
    _id: "innov-4",
    title: "Motores de flujo axial: menos peso, más potencia para motos eléctricas",
    slug: "motores-flujo-axial-motos-electricas",
    category: "innovations",
    tag: "Powertrain",
    excerpt:
      "El diseño de flujo axial reduce hasta un 40% el peso del motor frente a los diseños radiales tradicionales, sin sacrificar torque.",
    body: toBlocks(
      "El diseño de flujo axial reduce hasta un 40% el peso del motor frente a los diseños radiales tradicionales, sin sacrificar torque.\n\nVarios fabricantes de motos eléctricas ya evalúan su adopción para modelos 2027."
    ),
    author: "Redacción E-VIREXION",
    publishedAt: "2026-06-08",
    status: "published",
  },
];
