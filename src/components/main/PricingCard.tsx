"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CustomCardProps {
  title: string;
  price: string;
  type: "weekly" | "monthly";
}

const PricingCard: React.FC<CustomCardProps> = ({ title, price, type }) => {
  let increase = type === "monthly" ? 35 : 10;

  return (
    <div className="flex flex-col gap-10 items-center justify-center rounded-2xl bg-violet-400/20 h-full w-full border-2 border-violet-700 py-10 px-6 text-center max-w-[400px]">
      <span className="font-bold text-2xl">{title}</span>
      <span className="text-medium text-foreground/50 space-x-3">
        <span className="font-bold line-through	">
          {String(parseInt(price) + increase)}
        </span>
        <span className="font-bold text-4xl text-foreground">${price}</span>
        <span>USD</span>
      </span>
      <span className="text-xs">One-time payment. No subscription.</span>
      <Button variant="buy" size="lg" className="w-full">
        <Link href={"/buy/" + type}>Buy now</Link>
      </Button>
    </div>
  );
};

export default PricingCard;
