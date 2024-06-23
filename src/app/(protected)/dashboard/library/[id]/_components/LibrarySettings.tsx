"use client";
import DeleteLibrary from "../../../_components/DeleteLibrary";

interface LibrarySettingsTypes {
  id: string;
}
const LibrarySettings = ({ id }: LibrarySettingsTypes) => {
  return (
    <div className="flex flex-col gap-2">
      Library settings
      <DeleteLibrary id={id} />
    </div>
  );
};

export default LibrarySettings;
