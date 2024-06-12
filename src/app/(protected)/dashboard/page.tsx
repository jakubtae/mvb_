import { auth } from "@/auth";
import { redirect } from "next/navigation";
const DashboardPage = async () => {
  const session = await auth();
  if (!session) {
    return redirect("/auth/login");
  }
  return (
    <main className="px-[128px] py-20">
      <h1 className="text-8xl font-bold">
        Hello {session?.user.name?.split(" ").shift()}
      </h1>
    </main>
  );
};

export default DashboardPage;
