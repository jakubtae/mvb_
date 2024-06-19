import { auth } from "@/auth";
import { findUserLibraries } from "@/data/library";
import { redirect } from "next/navigation";
import { DataTable } from "../_components/Data-Table";
import { LocalLibrary, Columns } from "../_components/Columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SquarePlus } from "lucide-react";

const Libraries = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    console.log("No session ?");
    return redirect("/dashboard");
  }
  const Libraries = await findUserLibraries(session.user.id);
  return (
    <div className="w-full">
      <div className="w-full flex justify-between items-center mb-4">
        <h1 className="font-bold text-xl">Your libraries</h1>
        <Button variant="secondary" asChild>
          <Link href="/dashboard/library/create" className="flex gap-2">
            New library
            <SquarePlus />
          </Link>
        </Button>
      </div>
      <DataTable columns={Columns} data={Libraries} />
    </div>
  );
};

export default Libraries;
