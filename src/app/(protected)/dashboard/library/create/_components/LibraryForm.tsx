"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { newLibrary } from "@/actions/libCreate";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFieldArray } from "react-hook-form";
import { LibrarySchema } from "@/schemas";

const LibraryForm = () => {
  const router = useRouter();
  const { data: session } = useSession({ required: true });
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof LibrarySchema>>({
    resolver: zodResolver(LibrarySchema),
    defaultValues: {
      name: "",
      sources: [{ SourcesId: "1", text: "" }],
      visibility: "PRIVATE",
    },
  });

  const { control, handleSubmit, register, getFieldState } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sources",
  });

  const onSubmit = async (values: z.infer<typeof LibrarySchema>) => {
    setError("");
    setSuccess("");
    const id = session?.user.id as string;
    try {
      const data = await newLibrary(values, id);
      setError(data.error);
      setSuccess(data.success);
      if (data.success && data.id) {
        router.push(`/dashboard/library/${data.id || ""}`, { scroll: true });
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error creating library:", error);
    }
  };

  return (
    <Card className="w-full max-w-[600px] shadow-none border-none py-10">
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Library Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      disabled={form.formState.isSubmitting}
                      placeholder="Your library name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Sources</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <Input
                    {...register(`sources.${index}.text` as const)}
                    defaultValue={field.text}
                    placeholder="Enter a YouTube playlist link"
                    disabled={form.formState.isSubmitting}
                  />
                  {index > 0 && (
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={form.formState.isSubmitting}
                      variant="destructive"
                      className="px-2 text-xs md:text-small md:px-4 lg:text-base lg:px-6"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={() => append({ SourcesId: "new", text: "" })}
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                Add Source
              </Button>
              <FormMessage />
            </FormItem>
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    If set to public then anyone can view it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Create Library
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LibraryForm;
