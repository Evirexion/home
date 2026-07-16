import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-5 leading-relaxed text-silver-300 first:mt-0">{children}</p>,
    h2: ({ children }) => <h2 className="mt-10 text-2xl font-semibold text-silver-100">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 text-xl font-semibold text-silver-100">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-electric/40 pl-4 italic text-silver-300">{children}</blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noreferrer"
        className="text-electric underline underline-offset-2 hover:text-mint"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-semibold text-silver-100">{children}</strong>,
  },
};

export function ArticleBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="prose-none">
      <PortableText value={value} components={components} />
    </div>
  );
}
