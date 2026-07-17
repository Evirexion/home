import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Contáctanos",
  description:
    "Escríbenos sobre publicidad y alianzas, talleres y estaciones de carga, prensa o cualquier otro comentario.",
};

export default function ContactPage() {
  return (
    <div className="py-16 md:py-20">
      <Container>
        <SectionHeading
          eyebrow="Hablemos"
          title="Contáctanos"
          description="Cuéntanos qué necesitas y lo dirigimos al equipo correcto: publicidad, talleres y estaciones de carga, prensa, o cualquier otra consulta."
        />
        <Reveal className="mt-10 max-w-2xl">
          <ContactForm />
        </Reveal>
      </Container>
    </div>
  );
}
