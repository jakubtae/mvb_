import { auth } from "@/auth";
const DashboardPage = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    return console.log("No session id");
  }
  return (
    <>
      <h1 className="text-6xl font-bold">
        Hello {session?.user.name?.split(" ").shift()}
        This is the main dashboard
      </h1>
    </>
  );
};

export default DashboardPage;
