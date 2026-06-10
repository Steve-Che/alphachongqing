import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-stone-200 bg-[#f7f4ef]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-serif text-lg font-semibold text-stone-900">
          阿尔法重庆
        </Link>
        <nav className="flex items-center gap-4 text-sm text-stone-600">
          <Link href="/" className="hover:text-stone-900">
            城市地图
          </Link>
          {session?.user && (
            <>
              <Link href="/write/article" className="hover:text-stone-900">
                写长文
              </Link>
              <Link href="/write/moment" className="hover:text-stone-900">
                发短文
              </Link>
              <Link
                href={`/u/${session.user.username}`}
                className="hover:text-stone-900"
              >
                我的主页
              </Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin/invites" className="hover:text-stone-900">
                  邀请码
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <Button type="submit" variant="ghost" size="sm">
                  退出
                </Button>
              </form>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
