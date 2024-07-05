"use client";
import { Button } from "@/components/ui/button";
import { deleteFeature } from "../_actions/deleteFeature";
import { useToast } from "@/components/ui/use-toast";
import { updateFeature } from "../_actions/updateFeature";
import { Features } from "@prisma/client";
interface FeatureDeleteParams {
  id: string;
  formData: Features;
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useState, useTransition, useEffect } from "react";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { FeatureSchema } from "@/schemas";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

export type FeatureFormValues = z.infer<typeof FeatureSchema>;
function CalendarUpdate({ id, formData }: FeatureDeleteParams) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const { data: session, status } = useSession({ required: true });

  const form = useForm<FeatureFormValues>({
    resolver: zodResolver(FeatureSchema),
    defaultValues: {
      title: formData.title,
      publicDescription: formData.publicDescription,
      developerNote: formData.developerNote
        ? formData.developerNote
        : undefined,
      plannedFinish: formData.plannedFinish
        ? new Date(formData.plannedFinish)
        : undefined,
      createdBy: formData.createdBy,
      stage: formData.stage,
    },
  });

  useEffect(() => {
    if (session?.user.id) {
      form.setValue("createdBy", session.user.id);
    }
  }, [session, form]);

  // Early return based on session state
  if (!session?.user.id) {
    router.push("/dashboard");
    return null;
  }

  const onSubmit: SubmitHandler<FeatureFormValues> = (values) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      updateFeature(values, id).then((data: any) => {
        setError(data.error);
        setSuccess(data.success);
        if (data.success) {
          setTimeout(() => router.refresh(), 1000);
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Separator />
        <h2 className="text-lg md:text-xl font-bold"> Required Fields</h2>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  disabled={isPending}
                  placeholder="Public Feature Name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="publicDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Public Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isPending}
                  placeholder="Description of the feature"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <h2 className="text-lg md:text-xl font-bold"> Not required</h2>
        <div className="flex w-full flex-col md:flex-row items-center gap-2">
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem className="md:min-h-[100px] w-full">
                <FormLabel>Current Stage</FormLabel>
                <Select onValueChange={field.onChange} {...field}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="IDEA">Idea</SelectItem>
                    <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                    <SelectItem value="FINISHED">Finished</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  If set to public then anyone can view it.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="plannedFinish"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2.5 flex-grow flex-shrink basis-0 min-h-[100px] w-full md:w-auto">
                <FormLabel>Planned Finish</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      {...field}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="developerNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Developer Note</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  disabled={isPending}
                  placeholder="Developer Note"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormError message={error} />
        <FormSuccess message={success} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

const FeatureUpdate = ({ id, formData }: FeatureDeleteParams) => {
  return (
    <Dialog>
      <DialogTrigger asChild className="max-w-[300px]">
        <Button variant="outline">Update feature</Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit a new feture</DialogTitle>
          <DialogDescription>
            Fill out the below form to propose a new feature.
          </DialogDescription>
        </DialogHeader>
        <CalendarUpdate id={id} formData={formData} />
      </DialogContent>
    </Dialog>
  );
};

export default FeatureUpdate;
