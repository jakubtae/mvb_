import { db } from "@/lib/prismadb";

const getBugs = async () => {
  try {
    const bugs = await db.bugs.findMany({ where: { state: "NOT_SOLVED" } });
    if (!bugs) {
      throw new Error("Problem fetching bugs");
    }
    return { success: bugs };
  } catch (error) {
    console.error(error);
    return { error: error };
  }
};

const BugsPage = async () => {
  const bugs = await getBugs();
  if (bugs.error) return null;
  return (
    <>
      <p>Bugs Page</p>
      {bugs.success?.map((bug) => {
        return <>{bug.content}</>;
      })}
    </>
  );
};

export default BugsPage;
