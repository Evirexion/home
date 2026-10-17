import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/** The editorial that opens Edición 001 of the magazine (page 01). */
const PARAGRAPHS = [
  "Nos gustaba el sonido del motor. Sentíamos que un carro eléctrico era silencioso de una forma que nos incomodaba — como si le faltara algo. Pensábamos que consumían más, que no tenían autonomía, que eran para gente con mucho dinero o con agendas ambientales que no compartíamos.",
  "Estábamos equivocados. Y no nos avergüenza decirlo.",
  "Porque el día que empezamos a entender de verdad cómo funciona la movilidad eléctrica — no desde los titulares sino desde los números, desde la historia, desde las personas que llevan años construyendo esta industria en Colombia sin que nadie los estuviera mirando — algo cambió.",
  "No fue un momento dramático. Fue acumulación. Dato tras dato, historia tras historia, hasta que la pregunta dejó de ser: “¿por qué eléctrico?” y se convirtió en “¿por qué no lo hicimos antes?”",
  "E-Virexion nace de esa transformación personal.",
  "Nace porque creemos que hay miles en el mismo punto donde nosotros estuvimos — con dudas legítimas, con mitos arraigados, con preferencias formadas por años de cultura automotriz tradicional.",
  "Y creemos que lo que necesitan no es que los convenzan con propaganda. Sino que alguien les cuente la verdad completa, sin agenda, con rigor y con pasión.",
];

export function Manifesto() {
  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(0,255,65,0.08),transparent_60%)]"
      />
      <Container className="grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="text-xs uppercase tracking-[0.3em] text-electric">Editorial</p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-silver-100 md:text-6xl">
            Nosotros también fuimos <span className="brand-gradient-text">escépticos</span>
          </h2>
          <div className="mt-8 h-px w-24 bg-electric/60" />
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-7">
          <div className="space-y-5 text-lg leading-relaxed text-silver-300">
            {PARAGRAPHS.map((text, i) => (
              <p
                key={i}
                className={
                  text.startsWith("Estábamos") || text.startsWith("E-Virexion nace")
                    ? "font-medium text-silver-100"
                    : undefined
                }
              >
                {text}
              </p>
            ))}
            <p className="font-display text-2xl font-bold text-silver-100">
              Eso es lo que vamos a hacer.
              <br />
              <span className="brand-gradient-text">Edición tras edición. Bienvenidos.</span>
            </p>
            <p className="text-sm uppercase tracking-[0.2em] text-silver-500">— Equipo E-Virexion</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
