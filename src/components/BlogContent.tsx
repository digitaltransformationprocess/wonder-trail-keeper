import type { ReactNode } from "react";

/** Lightweight markdown-ish renderer for blog bodies (no extra dependency). */
export function BlogContent({ content }: { content: string }) {
  const blocks = content.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return (
    <div className="blog-prose space-y-5 text-[1.02rem] leading-[1.75] text-foreground/90">
      {blocks.map((block, i) => (
        <Block key={i} text={block.trim()} />
      ))}
    </div>
  );
}

function inlineFormat(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        parts.push(
          <a
            key={key++}
            href={link[2]}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            {link[1]}
          </a>,
        );
      }
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Block({ text }: { text: string }) {
  if (!text) return null;

  if (text.startsWith("### ")) {
    return <h3 className="type-title pt-2 text-[1.2rem] tracking-[-0.02em]">{inlineFormat(text.slice(4))}</h3>;
  }
  if (text.startsWith("## ")) {
    return <h2 className="type-title pt-4 text-[1.45rem] tracking-[-0.02em]">{inlineFormat(text.slice(3))}</h2>;
  }
  if (text.startsWith("# ")) {
    return <h2 className="type-title pt-4 text-[1.6rem] tracking-[-0.02em]">{inlineFormat(text.slice(2))}</h2>;
  }

  const lines = text.split("\n");
  const isUl = lines.every((l) => /^[-*]\s+/.test(l));
  const isOl = lines.every((l) => /^\d+\.\s+/.test(l));
  if (isUl) {
    return (
      <ul className="list-disc space-y-2 pl-5">
        {lines.map((l, i) => (
          <li key={i}>{inlineFormat(l.replace(/^[-*]\s+/, ""))}</li>
        ))}
      </ul>
    );
  }
  if (isOl) {
    return (
      <ol className="list-decimal space-y-2 pl-5">
        {lines.map((l, i) => (
          <li key={i}>{inlineFormat(l.replace(/^\d+\.\s+/, ""))}</li>
        ))}
      </ol>
    );
  }

  if (/^Pros\b/i.test(text) || /^Cons\b/i.test(text) || /^Verdict\b/i.test(text)) {
    const [head, ...rest] = lines;
    return (
      <div className="rounded-2xl border hairline bg-fill/40 px-5 py-4">
        <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {head.replace(/:$/, "")}
        </p>
        {rest.length ? (
          <div className="mt-2 space-y-1.5">
            {rest.map((l, i) => (
              <p key={i}>{inlineFormat(l.replace(/^[-*]\s+/, ""))}</p>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return <p>{inlineFormat(text.replace(/\n/g, " "))}</p>;
}
