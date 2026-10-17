import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MagazineReader } from "@/components/magazine/MagazineReader";
import { getCurrentUser } from "@/lib/accounts";
import { getEdition } from "@/data/editions";

export async function generateMetadata({ params }: { params: Promise<{ edicion: string }> }): Promise<Metadata> {
  const edition = getEdition((await params).edicion);
  return edition
    ? { title: `Edición ${edition.number} · ${edition.month}`, description: edition.title }
    : { title: "Revista" };
}

export default async function EditionPage({
  params,
  searchParams,
}: {
  params: Promise<{ edicion: string }>;
  searchParams: Promise<{ bienvenida?: string }>;
}) {
  const edition = getEdition((await params).edicion);
  if (!edition) notFound();
  const user = await getCurrentUser();
  const { bienvenida } = await searchParams;

  return (
    <div className="py-10 md:py-14">
      <Container className="max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/revista" className="inline-flex items-center gap-2 text-sm text-silver-500 hover:text-electric">
              <ArrowLeft className="h-4 w-4" /> Ediciones
            </Link>
            <h1 className="mt-3 font-display text-3xl font-bold text-silver-100 md:text-4xl">
              Edición {edition.number} · <span className="brand-gradient-text">{edition.month}</span>
            </h1>
            <p className="mt-1 text-silver-500">{edition.title}</p>
          </div>
          {!user && (
            <p className="text-sm text-silver-500">
              Estás viendo la vista previa.{" "}
              <Link href="/cuenta/registro" className="text-electric hover:underline">
                Regístrate gratis
              </Link>{" "}
              para leerla completa.
            </p>
          )}
        </div>
        {user && bienvenida && (
          <p className="mt-6 rounded-xl border border-electric/30 bg-electric/5 px-4 py-3 text-sm text-silver-100">
            ¡Bienvenido, {user.name}! Tu cuenta está activa: ya puedes leer la edición completa.
          </p>
        )}
        <div className="mt-8">
          <MagazineReader
            slug={edition.slug}
            totalPages={edition.pages}
            previewPages={edition.previewPages}
            canReadAll={Boolean(user)}
            width={edition.width}
            height={edition.height}
          />
        </div>
      </Container>
    </div>
  );
}
