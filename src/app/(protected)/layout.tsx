import DashboardNav from "@/components/DashboardNav";

export default async function Libraryayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="px-[128px] py-20 flex-grow flex flex-col gap-y-2">
        {children}
      </main>
    </div>
  );
}
