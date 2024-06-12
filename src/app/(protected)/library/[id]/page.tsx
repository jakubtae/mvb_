import { findLibraryById } from "@/data/library";
import { checkVideoStatus, VideoStatus } from "@/data/video";
import { stat } from "fs";
import { redirect } from "next/navigation";

interface LibraryIDPageProps {
  params: {
    id: string;
  };
}

const isValidObjectId = (id: string): boolean => {
  // Regular expression to match MongoDB ObjectId format
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  // Check if the provided id matches the ObjectId pattern
  return objectIdRegex.test(id);
};

const LibraryIDPage = async ({ params }: LibraryIDPageProps) => {
  if (!isValidObjectId(params.id)) {
    return (
      <>
        <h1>Provide correct library id</h1>
      </>
    );
  }

  const library = await findLibraryById(params.id);
  if (!library) {
    redirect("/library");
  }

  const { videos } = library;

  const fetchVideoStatuses = async () => {
    const statusPromises = videos.map(async (video_id) => {
      const status = await checkVideoStatus(video_id);
      return { video_id, ...status };
    });
    return Promise.all(statusPromises);
  };

  const statusComponent = async () => {
    const statuses = await fetchVideoStatuses();

    return (
      <>
        <h1>Video Status</h1>
        {statuses.map((status, index) => (
          <div key={index}>
            <p>Video ID: {status.video_id}</p>
            <p>Status: {status.status}</p>
          </div>
        ))}
      </>
    );
  };

  return (
    <div>
      {JSON.stringify(library)}
      {await statusComponent()}
    </div>
  );
};

export default LibraryIDPage;
