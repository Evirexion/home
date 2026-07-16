import type { Metadata } from "next";
import { cookies } from "next/headers";
import { INTERNAL_SESSION_COOKIE, isValidSession } from "@/lib/auth";
import { getPendingPosts } from "@/lib/posts";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoginForm } from "@/components/news/LoginForm";
import { DraftForm } from "@/components/news/DraftForm";
import { Badge } from "@/components/ui/Badge";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Acceso interno",
  robots: { index: false, follow: false },
};

export default async function NewsInternalPage() {
  const cookieStore = await cookies();
  const authed = await isValidSession(cookieStore.get(INTERNAL_SESSION_COOKIE)?.value);

  if (!authed) {
    return (
      <div className="flex min-h-[60vh] items-center py-16">
        <Container>
          <LoginForm />
        </Container>
      </div>
    );
  }

  const pending = await getPendingPosts();

  return (
    <div className="py-16 md:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Equipo editorial"
            title="Borradores de CORRIENTE / Innovación"
            description="Envía historias como borrador; un editor las revisa y publica desde Sanity Studio."
          />
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-silver-300/20 px-4 py-2 text-sm text-silver-300 ease-in-out transition-colors hover:border-electric/40 hover:text-electric"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <DraftForm />

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-silver-500">
              Pendientes de revisión ({pending.length})
            </h2>
            {pending.length === 0 && (
              <p className="metal-edge rounded-2xl border border-silver-300/15 bg-ink-raised p-5 text-sm text-silver-500">
                No hay borradores pendientes.
              </p>
            )}
            {pending.map((post) => (
              <div key={post._id} className="metal-edge rounded-2xl border border-silver-300/15 bg-ink-raised p-5">
                <Badge variant="silver">{post.tag}</Badge>
                <p className="mt-2 font-medium text-silver-100">{post.title}</p>
                <p className="mt-1 text-xs text-silver-500">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
