import { auth } from "@/auth";
import LibraryForm from "./_components/LibraryForm";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div className="flex flex-col w-full justify-center items-center">
      <h2 className="text-center font-bold text-6xl mb-6">
        Create a new YouTube library
      </h2>
      <LibraryForm />
    </div>
  );
};

export default DashboardPage;
