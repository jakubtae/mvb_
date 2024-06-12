export default async function Libraryayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="px-[128px] py-20">{children}</main>;
}
