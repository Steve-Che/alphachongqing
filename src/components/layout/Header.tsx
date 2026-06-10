import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { getUserResidence } from "@/lib/queries";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth();
  const residence = session?.user?.id
    ? await getUserResidence(session.user.id)
    : null;

  return (
    <header className="border-b border-stone-200 bg-[#f7f4ef]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0 font-serif text-lg font-semibold text-stone-900">
          阿尔法重庆
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm text-stone-600">
          <Link href="/" className="hover:text-stone-900">
            地图
          </Link>
          <Link href="/guide" className="hover:text-stone-900">
            入驻指南
          </Link>
          {session?.user && (
            <>
              {residence?.shop && (
                <Link href={`/shop/${residence.shop.slug}`} className="text-accent hover:underline">
                  我的店铺
                </Link>
              )}
              {residence?.apartmentUnit && (
                <Link
                  href={`/apartment/${residence.apartmentUnit.id}`}
                  className="text-accent hover:underline"
                >
                  我的公寓
                </Link>
              )}
              {!residence?.shop && !residence?.apartmentUnit && (
                <Link href="/guide" className="text-amber-700 hover:underline">
                  选地盘
                </Link>
              )}
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
