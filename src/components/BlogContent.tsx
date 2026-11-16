import type { ReactNode } from "react";

type BlockNode =
  | { type: "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "callout"; label: string; items: string[] };

/** Lightweight markdown-ish renderer for blog / Latest bodies (no extra dependency). */
export function BlogContent({
  content,
  variant = "article",
}: {
  content: string;
  /** `advance` turns ## sections into readable fact cards for product updates. */
  variant?: "article" | "advance";
}) {
  const blocks = parseBlocks(content.replace(/\r\n/g, "\n").trim());
  if (variant === "advance") {
    return <AdvanceSections blocks={blocks} />;
  }
  return (
    <div className="blog-prose space-y-5 text-[1.05rem] leading-[1.75] text-foreground/90">
      {blocks.map((block, i) => (
        <ArticleBlock key={i} block={block} />
      ))}
    </div>
  );
}

function inlineFormat(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="rounded-md bg-fill px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
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

function parseBlocks(content: string): BlockNode[] {
  const lines = content.split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const line = raw.trimEnd();
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i += 1;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "h2", text: line.slice(2).trim() });
      i += 1;
      continue;
    }

    if (/^Pros\b/i.test(line) || /^Cons\b/i.test(line) || /^Verdict\b/i.test(line)) {
      const label = line.replace(/:$/, "").trim();
      const items: string[] = [];
      i += 1;
      while (i < lines.length) {
        const next = (lines[i] ?? "").trim();
        if (!next) break;
        if (/^(#{1,3}\s|Pros\b|Cons\b|Verdict\b)/i.test(next)) break;
        items.push(next.replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "callout", label, items });
      continue;
    }

    if (/^[-*]\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test((lines[i] ?? "").trim())) {
        items.push((lines[i] ?? "").trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test((lines[i] ?? "").trim())) {
        items.push((lines[i] ?? "").trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const para: string[] = [line.trim()];
    i += 1;
    while (i < lines.length) {
      const next = (lines[i] ?? "").trimEnd();
      if (!next.trim()) break;
      if (/^(#{1,3}\s|[-*]\s|\d+\.\s|Pros\b|Cons\b|Verdict\b)/i.test(next.trim())) break;
      para.push(next.trim());
      i += 1;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }

  return blocks;
}

function ArticleBlock({ block }: { block: BlockNode }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="type-title pt-6 text-[1.35rem] tracking-[-0.02em] text-balance text-foreground md:text-[1.5rem]">
          {inlineFormat(block.text)}
        </h2>
      );
    case "h3":
      return (
        <h3 className="type-title pt-3 text-[1.15rem] tracking-[-0.02em] text-balance text-foreground">
          {inlineFormat(block.text)}
        </h3>
      );
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-5 text-pretty">
          {block.items.map((item, i) => (
            <li key={i}>{inlineFormat(item)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-2 pl-5 text-pretty">
          {block.items.map((item, i) => (
            <li key={i}>{inlineFormat(item)}</li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div className="rounded-2xl border hairline bg-fill/40 px-5 py-4">
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {block.label}
          </p>
          {block.items.length ? (
            <div className="mt-2 space-y-1.5 text-pretty">
              {block.items.map((item, i) => (
                <p key={i}>{inlineFormat(item)}</p>
              ))}
            </div>
          ) : null}
        </div>
      );
    default:
      return <p className="text-pretty">{inlineFormat(block.text)}</p>;
  }
}

const ADVANCE_SECTION_HINTS = [
  "what shipped",
  "who it is for",
  "pricing notes",
  "faq",
  "availability",
  "access",
];

function AdvanceSections({ blocks }: { blocks: BlockNode[] }) {
  const sections: { title: string; nodes: BlockNode[] }[] = [];
  let current: { title: string; nodes: BlockNode[] } | null = null;
  const lead: BlockNode[] = [];

  for (const block of blocks) {
    if (block.type === "h2") {
      current = { title: block.text, nodes: [] };
      sections.push(current);
      continue;
    }
    if (current) current.nodes.push(block);
    else lead.push(block);
  }

  return (
    <div className="space-y-5">
      {lead.length ? (
        <div className="space-y-4 text-[1.05rem] leading-[1.75] text-foreground/90">
          {lead.map((block, i) => (
            <ArticleBlock key={`lead-${i}`} block={block} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4">
        {sections.map((section, i) => {
          const key = section.title.toLowerCase();
          const isFact = ADVANCE_SECTION_HINTS.some((h) => key.includes(h));
          return (
            <section
              key={`${section.title}-${i}`}
              className={
                isFact
                  ? "rounded-3xl border hairline bg-fill/30 px-5 py-5 md:px-6 md:py-6"
                  : "space-y-3 pt-2"
              }
            >
              <h2 className="type-title text-[0.8rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-[1.02rem] leading-[1.7] text-foreground/90">
                {section.nodes.map((node, j) => {
                  if (node.type === "h3") {
                    return (
                      <h3
                        key={j}
                        className="type-title pt-2 text-[1.05rem] tracking-[-0.02em] text-foreground"
                      >
                        {inlineFormat(node.text)}
                      </h3>
                    );
                  }
                  return <ArticleBlock key={j} block={node} />;
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
