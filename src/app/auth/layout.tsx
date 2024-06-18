const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="w-full h-[80vh] flex items-start md:items-center justify-center px-4 py-10">
      {children}
    </main>
  );
};

export default AuthLayout;
