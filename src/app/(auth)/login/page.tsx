import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { sanitizeCallbackUrl } from "@/lib/callback-url";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; callbackUrl?: string }>;
}) {
  const { reset, callbackUrl } = await searchParams;
  const safeCallback = sanitizeCallbackUrl(callbackUrl);

  return (
    <div className="rounded border border-stone-200 bg-paper p-8 shadow-sm">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        进入阿尔法重庆
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        一座可以开店、入住、写字的虚拟山城
      </p>
      {reset === "1" && (
        <p className="mt-3 rounded bg-green-50 px-3 py-2 text-sm text-green-800">
          密码已重置，请使用新密码登录。
        </p>
      )}
      <div className="mt-6">
        <LoginForm callbackUrl={safeCallback} />
      </div>
      <p className="mt-6 text-center text-sm text-stone-500">
        还没有账号？{" "}
        <Link href="/register" className="text-accent underline">
          邀请码注册
        </Link>
      </p>
    </div>
  );
}
