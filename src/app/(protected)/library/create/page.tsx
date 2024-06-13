import { auth } from "@/auth";
import LibraryForm from "./_components/LibraryForm";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div className="flex flex-col w-full justify-center items-center">
      <LibraryForm />
    </div>
  );
};

export default DashboardPage;
