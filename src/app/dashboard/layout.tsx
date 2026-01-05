import { IconNav } from "@/components/dashboard/navigation/icon-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-space-950">
      {/* Cosmic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-space-950 via-space-900 to-space-950" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.08),transparent_40%)]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06),transparent_40%)]"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-orange-400/8 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-gradient-to-br from-violet-400/8 to-purple-400/8 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-amber-400/6 to-yellow-400/4 rounded-full blur-3xl opacity-40"></div>

        {/* N'Ko script floating elements - hidden on mobile for cleaner UI */}
        <div className="hidden md:block absolute top-20 left-1/4 text-amber-400/15 text-4xl font-nko">ߒ</div>
        <div className="hidden md:block absolute top-1/3 right-1/4 text-violet-400/12 text-3xl font-nko">ߓ</div>
        <div className="hidden lg:block absolute bottom-1/3 left-1/3 text-amber-300/12 text-5xl font-nko">ߕ</div>
        <div className="hidden lg:block absolute bottom-1/4 right-1/5 text-orange-400/8 text-4xl font-nko">ߞ</div>
      </div>

      {/* Top Icon Navigation */}
      <IconNav />

      {/* Main Content */}
      <main className="relative z-10 pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}