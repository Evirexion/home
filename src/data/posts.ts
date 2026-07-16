import type { Post } from "@/types/content";

/**
 * Placeholder editorial content. Structure mirrors the `post` document type
 * in /studio (shared by CORRIENTE/news and innovations, distinguished by
 * `category`), so this can be swapped for a live Sanity query (see
 * lib/posts.ts) without UI changes.
 */
export const mockPosts: Post[] = [
  {
    _id: "post-1",
    title: "Bogotá suma 40 buses eléctricos nuevos a su flota de TransMilenio",
    slug: "bogota-40-buses-electricos-transmilenio",
    category: "corriente",
    tag: "Movilidad urbana",
    excerpt:
      "La flota eléctrica del sistema troncal supera las 1,600 unidades, consolidando a la capital como la ciudad con más buses eléctricos fuera de China.",
    body: "La flota eléctrica del sistema troncal supera las 1,600 unidades, consolidando a la capital como la ciudad con más buses eléctricos fuera de China. Los nuevos vehículos operarán en los portales de Suba y Usme, reduciendo en un estimado de 3,200 toneladas de CO2 al año.",
    author: "Redacción E-VIREXION",
    publishedAt: "2026-07-10",
    status: "published",
  },
  {
    _id: "post-2",
    title: "Gobierno anuncia arancel cero para vehículos eléctricos importados hasta 2027",
    slug: "arancel-cero-vehiculos-electricos-2027",
    category: "corriente",
    tag: "Política pública",
    excerpt:
      "La medida busca acelerar la adopción de EVs en Colombia, donde representan apenas el 3.2% de las ventas totales de vehículos nuevos.",
    body: "La medida busca acelerar la adopción de EVs en Colombia, donde representan apenas el 3.2% de las ventas totales de vehículos nuevos. El Ministerio de Comercio estima que la exención podría reducir el precio de entrada en un 19% promedio.",
    author: "Redacción E-VIREXION",
    publishedAt: "2026-07-05",
    status: "published",
  },
  {
    _id: "post-3",
    title: "Medellín inaugura su primer corredor de carga rápida en la Autopista Sur",
    slug: "medellin-corredor-carga-rapida-autopista-sur",
    category: "corriente",
    tag: "Infraestructura",
    excerpt:
      "Ocho estaciones de carga ultrarrápida conectarán el Valle de Aburrá con el Eje Cafetero, con tiempos de carga de 18 minutos al 80%.",
    body: "Ocho estaciones de carga ultrarrápida conectarán el Valle de Aburrá con el Eje Cafetero, con tiempos de carga de 18 minutos al 80%. El proyecto es una alianza entre EPM y tres operadores privados de movilidad eléctrica.",
    author: "Redacción E-VIREXION",
    publishedAt: "2026-06-28",
    status: "published",
  },
  {
    _id: "post-4",
    title: "Ventas de motos eléctricas crecen 68% interanual en Colombia",
    slug: "ventas-motos-electricas-crecen-2026",
    category: "corriente",
    tag: "Mercado",
    excerpt:
      "El segmento de dos ruedas lidera la transición eléctrica del país, impulsado por domicilios y micro-movilidad urbana.",
    body: "El segmento de dos ruedas lidera la transición eléctrica del país, impulsado por domicilios y micro-movilidad urbana. Marcas como AKT y Segway ya representan más del 40% de las matrículas eléctricas nuevas.",
    author: "Redacción E-VIREXION",
    publishedAt: "2026-06-15",
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
    body: "Fabricantes asiáticos aceleran la producción piloto de celdas de estado sólido, prometiendo autonomías superiores a 800 km y tiempos de carga bajo 10 minutos. Analistas anticipan su llegada comercial a Latinoamérica hacia 2029.",
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
    body: "La tecnología V2H permite usar la batería del vehículo como respaldo energético durante cortes de luz, un caso de uso clave en zonas con red inestable. Los primeros pilotos en Colombia arrancarán en Barranquilla y Cali este año.",
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
    body: "Startups colombianas desarrollan algoritmos que combinan clima, tráfico y nivel de batería para maximizar la eficiencia de flotas EV. Las primeras pruebas muestran ahorros de hasta 22% en consumo energético por ruta.",
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
    body: "El diseño de flujo axial reduce hasta un 40% el peso del motor frente a los diseños radiales tradicionales, sin sacrificar torque. Varios fabricantes de motos eléctricas ya evalúan su adopción para modelos 2027.",
    author: "Redacción E-VIREXION",
    publishedAt: "2026-06-08",
    status: "published",
  },
];
