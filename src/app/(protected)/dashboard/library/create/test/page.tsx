"use client";
import { useForm, UseFormProps, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const playlistRegex =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:playlist\?list=|.*[?&]list=)([A-Za-z0-9_-]+)(?:&.*)?$/;

// const userRegex = /^https:\/\/www\.youtube\.com\/@[A-Za-z0-9_-]+$/;
// const channelRegex = /^https:\/\/www\.youtube\.com\/channel\/[A-Za-z0-9_-]+$/;
// const videoRegex = /^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+(&t=\d+s)?$/;

const youtubeUrlValidation = z.string().refine(
  async (url: string) => {
    try {
      return playlistRegex.test(url);
    } catch (error) {
      return false;
    }
  },
  {
    message: "Must be a valid YouTube public playlist link",
  }
);

const validationSchema = z.object({
  sources: z
    .array(z.object({ SourcesId: z.string(), text: youtubeUrlValidation }))
    .min(1, { message: "Must be at least one source" }),
});

type Sources = z.infer<typeof validationSchema>["sources"][number];

const sourcesInitial: Sources[] = [{ SourcesId: "1", text: "" }];

function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  }
) {
  const form = useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema, undefined, {
      // This makes it so we can use `.transform()`s on the schema without same transform getting applied again when it reaches the server
      raw: true,
    }),
  });

  return form;
}

export default function App() {
  // assume this comes from backend
  const [sources, setsources] = useState<Sources[]>(() => sourcesInitial);

  const {
    handleSubmit,
    register,
    control,
    formState: { isValid, errors, isValidating, isDirty },
    reset,
  } = useZodForm({
    schema: validationSchema,
    defaultValues: { sources },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "sources",
    control,
  });

  const isSubmittable = !!isDirty && !!isValid;

  return (
    <div>
      <form
        onSubmit={handleSubmit((data) => {
          console.log("Data submitted:", data);
          setsources(data.sources); //TODO here send the request
          reset(data);
        })}
        className="w-full space-y-6 px-32 py-16"
      >
        <h2 className="text-xl font-bold">Change the data</h2>

        {fields.map((field, index) => {
          return (
            <div className="flex gap-2 items-center" key={field.id}>
              <Input
                {...register(`sources.${index}.text` as const)}
                placeholder="Enter a text.."
                defaultValue={field.text}
              />

              <Button
                variant="destructive"
                type="button"
                onClick={() => remove(index)}
              >
                Delete
              </Button>
            </div>
          );
        })}

        <Button
          variant="buy"
          type="button"
          onClick={() =>
            append({
              SourcesId: "new",
              text: "",
            })
          }
        >
          Append
        </Button>

        <div className=" h-32">
          <Button disabled={!isSubmittable} type="submit" variant="secondary">
            <p>Submit</p>
          </Button>
        </div>
      </form>
    </div>
  );
}
