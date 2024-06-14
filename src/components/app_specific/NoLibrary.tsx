import { Button } from "@/components/ui/button";
import Link from "next/link";

const NoLibrary = () => {
  return (
    <div className="flex items-center justify-center gap-6 mt-5">
      <p>No libraries associated with your account.</p>
      <Button>
        <Link href="/library/create">Create a new library</Link>
      </Button>
    </div>
  );
};

export default NoLibrary;
