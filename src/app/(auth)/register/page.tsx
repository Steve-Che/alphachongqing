import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="rounded border border-stone-200 bg-paper p-8 shadow-sm">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        邀请码注册
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        阿尔法重庆目前为邀请制，请使用有效邀请码注册。
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-stone-500">
        已有账号？{" "}
        <Link href="/login" className="text-accent underline">
          登录
        </Link>
      </p>
    </div>
  );
}
