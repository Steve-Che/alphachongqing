"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createArticle } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ArticleEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "写下你的长文…" }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    editorProps: {
      attributes: {
        class:
          "prose-retro min-h-[300px] rounded border border-stone-200 bg-white p-4 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  async function handleImageUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) editor.chain().focus().setImage({ src: data.url }).run();
    };
    input.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editor) return;
    setLoading(true);
    setError("");
    const result = await createArticle({
      title,
      body: editor.getHTML(),
      coverUrl: coverUrl || undefined,
    });
    if (result.ok && result.data?.id) {
      router.push(`/article/${result.data.id}`);
      router.refresh();
    } else if (!result.ok) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="文章标题"
        required
      />
      <Input
        value={coverUrl}
        onChange={(e) => setCoverUrl(e.target.value)}
        placeholder="封面图 URL（可选，也可在正文中插图）"
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleImageUpload}>
          插入图片
        </Button>
      </div>
      <EditorContent editor={editor} />
      <Button type="submit" disabled={loading || !editor}>
        {loading ? "发布中…" : "发布长文"}
      </Button>
    </form>
  );
}
