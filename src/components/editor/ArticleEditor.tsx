"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createArticle, updateArticle } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/upload-client";

export function ArticleEditor({
  postId,
  initialTitle = "",
  initialBody = "",
  initialCoverUrl = "",
}: {
  postId?: string;
  initialTitle?: string;
  initialBody?: string;
  initialCoverUrl?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEdit = !!postId;

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
    content: initialBody,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && initialBody && !editor.getText()) {
      editor.commands.setContent(initialBody);
    }
  }, [editor, initialBody]);

  async function handleImageUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const result = await uploadImage(file, "content");
      if (result.ok) editor.chain().focus().setImage({ src: result.url }).run();
      else toast.error(result.error);
    };
    input.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editor) return;
    setLoading(true);
    setError("");
    const payload = {
      title,
      body: editor.getHTML(),
      coverUrl: coverUrl || undefined,
    };
    const result = isEdit
      ? await updateArticle({ id: postId!, ...payload })
      : await createArticle(payload);
    if (result.ok && result.data?.id) {
      toast.success(isEdit ? "文章已更新" : "长文已发布");
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
        {loading ? "保存中…" : isEdit ? "保存修改" : "发布长文"}
      </Button>
    </form>
  );
}
