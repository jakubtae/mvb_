const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="w-full h-[80vh] flex items-center justify-center mt-10">
      {children}
    </main>
  );
};

export default AuthLayout;
