export default async function Libraryayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-col min-h-screen relative">
      <main className="px-4 md:px-10 lg:px-[128px] py-20 flex-grow flex flex-col gap-y-2 items-center justify-center relative w-full">
        {children}
      </main>
    </div>
  );
}
