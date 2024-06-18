import { auth } from "@/auth";
import { findUserLibraries } from "@/data/library";
import { redirect } from "next/navigation";
import { DataTable } from "../_components/Data-Table";
import { LocalLibrary, Columns } from "../_components/Columns";

const Libraries = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    console.log("No session ?");
    return redirect("/dashboard");
  }
  const Libraries = await findUserLibraries(session.user.id);
  return (
    <>
      <h1 className="font-bold text-xl">Your libraries</h1>
      <DataTable columns={Columns} data={Libraries} />
    </>
  );
};

export default Libraries;
