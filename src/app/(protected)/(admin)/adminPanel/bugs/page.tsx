import { cache } from "@/lib/cache";
import { db } from "@/lib/prismadb";

const getBugs = cache(
  async () => {
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
  },
  ["/", "daminPanel", "getBugs"],
  { revalidate: 60 * 60 * 2, tags: ["getBugs"] }
);

const BugsPage = async () => {
  const bugs = await getBugs();
  if (bugs.error) return null;
  return (
    <>
      <p>Bugs Page</p>
      {bugs.success?.map((bug, key) => {
        const formatedDate = new Date(bug.createdAt);
        const date = formatedDate.toDateString();
        return (
          <div key={key}>
            <h3>Bug #{bug.serialNumber}</h3>
            {bug.content}
            <div className="flex gap-2 justify-between items-center">
              <span>{bug.state}</span>
              <span>{bug.createdBy}</span>
              {date}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default BugsPage;
