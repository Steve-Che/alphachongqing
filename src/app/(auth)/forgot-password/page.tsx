import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded border border-stone-200 bg-paper p-8 shadow-sm">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        找回密码
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        输入注册邮箱，我们将发送重置链接（1 小时内有效）。
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
