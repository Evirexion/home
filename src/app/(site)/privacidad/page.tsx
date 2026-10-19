import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { DATA_CONTROLLER, PRIVACY_POLICY_VERSION } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos Personales",
  description: "Cómo E-VIREXION recoge, usa y protege tus datos personales (Ley 1581 de 2012).",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-silver-100">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-silver-300">{children}</div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="relative pl-5 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-electric"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  const c = DATA_CONTROLLER;
  const mail = (
    <a href={`mailto:${c.email}`} className="text-electric hover:underline">
      {c.email}
    </a>
  );
  const updated = new Date(`${PRIVACY_POLICY_VERSION}T12:00:00`).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="py-16 md:py-20">
      <Container className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-electric">Legal</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-silver-100 md:text-4xl">
          Política de Tratamiento de Datos Personales
        </h1>
        <p className="mt-3 text-sm text-silver-500">Vigente desde el {updated}.</p>

        <Section title="1. Responsable del tratamiento">
          <List
            items={[
              <>Responsable: {c.legalName}{c.nit ? `, NIT ${c.nit}` : ""}.</>,
              <>Domicilio: {c.city}.</>,
              <>Correo para consultas y reclamos sobre datos personales: {mail}.</>,
              <>Sitio web: {c.website}.</>,
            ]}
          />
          <p>
            Esta política se expide en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el
            Decreto Único 1074 de 2015) y demás normas que las modifiquen o complementen.
          </p>
        </Section>

        <Section title="2. Qué datos recogemos">
          <List
            items={[
              "Al crear una cuenta: nombre, correo electrónico y contraseña (que guardamos cifrada; nunca la vemos ni la conocemos).",
              "Si eliges “Continuar con Google”: tu nombre, tu correo y un identificador de tu cuenta de Google que la propia Google nos entrega con tu permiso. No recibimos tu contraseña de Google ni accedemos a tu correo, contactos o archivos.",
              "Prueba de tu autorización: fecha y hora, versión de esta política y dirección IP desde la que la otorgaste.",
              "Tu preferencia sobre recibir correos con novedades.",
              "Datos técnicos mínimos para mantener tu sesión iniciada (una cookie de sesión).",
              "Si nos escribes por el formulario de contacto: tu nombre, correo y mensaje.",
            ]}
          />
          <p>No solicitamos datos sensibles ni datos de niñas, niños o adolescentes.</p>
        </Section>

        <Section title="3. Para qué los usamos (finalidades)">
          <List
            items={[
              "Crear, administrar y proteger tu cuenta, y verificar que el correo te pertenece.",
              "Darte acceso a la revista digital y a los contenidos reservados para lectores registrados.",
              "Enviarte correos operativos de tu cuenta (activación, cambio de contraseña).",
              "Solo si lo autorizas: enviarte nuevas ediciones, novedades y contenidos de E-VIREXION. Puedes retirar esta autorización en cualquier momento desde tu cuenta o en el enlace de cada correo.",
              "Elaborar estadísticas agregadas y anónimas sobre la lectura de la revista.",
              "Atender tus consultas, peticiones y reclamos, y cumplir obligaciones legales.",
            ]}
          />
          <p>No vendemos, alquilamos ni cedemos tus datos personales a terceros.</p>
        </Section>

        <Section title="4. Tus derechos">
          <p>Como titular de los datos tienes derecho a:</p>
          <List
            items={[
              "Conocer, actualizar y rectificar tus datos personales.",
              "Solicitar prueba de la autorización que nos otorgaste.",
              "Ser informado, previa solicitud, sobre el uso que les hemos dado.",
              "Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley, después de haber agotado el trámite de consulta o reclamo ante nosotros.",
              "Revocar la autorización y/o pedir la supresión de tus datos cuando no exista un deber legal o contractual de conservarlos.",
              "Acceder gratuitamente a tus datos personales.",
            ]}
          />
          <p>
            Desde la sección <strong className="text-silver-100">Mi cuenta</strong> puedes actualizar tu nombre, cambiar
            tus preferencias de correo y eliminar tu cuenta de forma inmediata.
          </p>
        </Section>

        <Section title="5. Cómo ejercer tus derechos">
          <p>
            Escribe a {mail} indicando tu nombre, el correo de tu cuenta, la descripción de tu solicitud y, si aplica, los
            documentos que quieras hacer valer.
          </p>
          <List
            items={[
              "Consultas: las respondemos en máximo diez (10) días hábiles desde su recibo. Si no es posible en ese plazo, te informaremos el motivo y la nueva fecha, que no superará cinco (5) días hábiles adicionales.",
              "Reclamos (corrección, actualización, supresión o incumplimiento): los atendemos en máximo quince (15) días hábiles desde su recibo, prorrogables hasta ocho (8) días hábiles más, informándote el motivo. Si el reclamo está incompleto, te pediremos completarlo dentro de los cinco (5) días siguientes; si pasan dos (2) meses sin que lo completes, entenderemos que desististe.",
            ]}
          />
        </Section>

        <Section title="6. Proveedores y transferencia internacional">
          <p>
            Para operar el sitio usamos proveedores que tratan datos por nuestra cuenta y bajo nuestras instrucciones
            (encargados): Cloudflare, Inc. (alojamiento del sitio y la base de datos de cuentas) y Resend (envío de
            correos de la cuenta). Estos proveedores pueden almacenar o procesar la información fuera de Colombia,
            incluido Estados Unidos. Al aceptar esta política autorizas esa transmisión, que se hace con medidas de
            seguridad adecuadas y solo para las finalidades descritas.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            Usamos una cookie de sesión estrictamente necesaria para mantenerte conectado a tu cuenta. No usamos cookies
            publicitarias.
          </p>
        </Section>

        <Section title="8. Seguridad">
          <p>
            Las contraseñas se guardan cifradas con un algoritmo de derivación de claves; las sesiones y los enlaces de
            correo usan códigos aleatorios que no se almacenan en texto plano; toda la comunicación con el sitio viaja
            cifrada (HTTPS). Ninguna medida es infalible, pero trabajamos para proteger tu información contra acceso,
            uso o pérdida no autorizados.
          </p>
        </Section>

        <Section title="9. Conservación">
          <p>
            Conservamos tus datos mientras tengas una cuenta activa. Si eliminas tu cuenta, borramos tus datos de nuestra
            base de datos de forma inmediata, salvo aquellos que debamos conservar por un deber legal.
          </p>
        </Section>

        <Section title="10. Cambios a esta política">
          <p>
            Si cambiamos esta política de forma sustancial, lo publicaremos en esta página y, cuando el cambio afecte las
            finalidades del tratamiento, te pediremos de nuevo tu autorización.
          </p>
        </Section>
      </Container>
    </article>
  );
}
