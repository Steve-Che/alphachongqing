import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 pb-20 md:pb-8">{children}</main>
      <MobileBottomNav />
      <Toaster />
    </>
  );
}
