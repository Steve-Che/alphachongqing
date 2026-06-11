"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profile";
import { Avatar } from "@/components/social/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/lib/upload-client";

export function ProfileSettingsForm({
  user,
}: {
  user: {
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    const result = await uploadImage(file, "avatar");
    setUploading(false);
    if (result.ok) setAvatarUrl(result.url);
    else toast.error(result.error);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await updateProfile({ displayName, bio, avatarUrl });
    if (result.ok) {
      toast.success("资料已更新");
      router.refresh();
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded border border-stone-200 bg-paper p-5">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="flex items-center gap-4">
        <Avatar
          username={user.username}
          displayName={displayName}
          avatarUrl={avatarUrl}
          size="lg"
        />
        <label className="cursor-pointer text-sm text-accent hover:underline">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleAvatarUpload(f);
            }}
          />
          {uploading ? "压缩并上传中…" : "更换头像"}
        </label>
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-600">用户名</label>
        <Input value={`@${user.username}`} disabled />
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-600">显示名称</label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="街坊们看到的名字"
          maxLength={40}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-600">简介</label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="一句话介绍自己"
          rows={3}
          maxLength={200}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "保存中…" : "保存"}
      </Button>
    </form>
  );
}
