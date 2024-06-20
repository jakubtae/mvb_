import { auth } from "@/auth";
import { redirect } from "next/navigation";

const AdminPage = async () => {
  const session = await auth();
  if (!session || !session.user || session.user.role === "USER") {
    redirect("/dashboard");
  }
  return (
    <>
      <>Hello Admin {session.user.name}</> <br />
      <>If you are not an admin please tell us and leave this page alone.</>
    </>
  );
};

export default AdminPage;
