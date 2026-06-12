import sanitizeHtml from "sanitize-html";

/** 将站内公版书 Markdown 转为安全 HTML（仅支持常用语法） */
export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inParagraph = false;

  function closeParagraph() {
    if (inParagraph) {
      html.push("</p>");
      inParagraph = false;
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      closeParagraph();
      continue;
    }

    if (line.startsWith("# ")) {
      closeParagraph();
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeParagraph();
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      closeParagraph();
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (line === "---" || line === "***") {
      closeParagraph();
      html.push("<hr />");
      continue;
    }

    if (!inParagraph) {
      html.push("<p>");
      inParagraph = true;
    } else {
      html.push("<br />");
    }
    html.push(inline(line));
  }

  closeParagraph();

  return sanitizeHtml(html.join(""), {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "p",
      "br",
      "hr",
      "strong",
      "em",
      "a",
    ],
    allowedAttributes: { a: ["href", "target", "rel"] },
  });
}

function inline(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return s;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
