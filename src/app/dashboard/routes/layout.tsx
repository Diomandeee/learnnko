import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default async function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-[2000px] mx-auto p-4 md:px-6 md:py-6">
    {children}
    </div>
  );
}