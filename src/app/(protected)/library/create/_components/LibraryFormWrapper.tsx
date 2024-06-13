"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface CardWrapperProps {
  children: React.ReactNode;
}
const LibraryFormWrapper = ({ children }: CardWrapperProps) => {
  return (
    <Card className="w-[700px] shadow-none border-none py-10">
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default LibraryFormWrapper;
