import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <div className="rounded border border-stone-200 bg-paper p-8 shadow-sm">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        设置新密码
      </h1>
      <p className="mt-2 text-sm text-stone-500">请为你的账号设置一个新密码。</p>
      <div className="mt-6">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
