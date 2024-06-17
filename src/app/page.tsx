import MainCard from "@/components/main/MainCard";
import PricingCard from "@/components/main/PricingCard";
import Testimonials from "@/components/main/Testimonials";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const cards = [
    {
      src: "/example.png",
      alt: "examplImg",
      title: "1. Import sources",
      description:
        "Currently you can import YouTube playlists as a source. We are working to support single videos and channels. In the future you will be able to add content from X, Instagram and others.",
    },
    {
      src: "/example.png",
      alt: "examplImg",
      title: "2. Wait for the process to finish",
      description:
        "Because we need to fetch content from provided sources it might take a few minutes for every time a certain piece of content is used. The second time will take only a few seconds",
    },
    {
      src: "/example.png",
      alt: "examplImg",
      title: "3. Find what you want",
      description:
        "Now it's time for research. Use the search bard to find what you want. Choose between actual search and sematnic search. Peek at common topics and related materials",
    },
  ];
  return (
    <div className="flex flex-col gap-10">
      <main
        className="pt-20 relative flex flex-col gap-6 justify-start items-center text-center p-20"
        id="main"
      >
        <h1 className="text-5xl font-bold drop-shadow-xl capitalize w-2/3">
          Make researching content easy{" "}
          <span className="lowercase">with an effective tool</span>
        </h1>
        <h2 className="text-lg font-medium w-3/4">
          <span className="font-bold lowercase">medialibrary</span> allows you
          to import Tweets, YouTube videos / playlists and other content to make
          your research smooth and clean
        </h2>
        <div className="flex gap-6">
          <Button
            variant="default"
            size="lg"
            className="font-bold text-lg py-6"
          >
            <Link href="/auth/login">Start now</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="font-bold text-lg py-6"
          >
            <Link href="loom link">Watch a demo</Link>
          </Button>
        </div>
        <span>8498 researchers already love it</span>
      </main>
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-bold drop-shadow-xl capitalize">
          How it works?
        </h2>
        <div className="p-20 grid gap-6 grid-cols-3">
          {cards.map((card, key) => (
            <MainCard
              key={key}
              src={card.src}
              alt={card.alt}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center bg-violet-400/30 py-20 gap-10 px-20">
        <h2 className="text-3xl font-bold drop-shadow-xl capitalize">
          Testimonials
        </h2>
        <Testimonials />
      </div>
      <div className="flex flex-col items-center px-20">
        <h2 className="text-3xl font-bold drop-shadow-xl capitalize">
          Pricing
        </h2>
        <div className="w-2/3 p-20 grid grid-cols-2 gap-10">
          <PricingCard title="Weekly pass" type="weekly" price="10" />
          <PricingCard title="Monthly pass" type="monthly" price="35" />
        </div>
      </div>
    </div>
  );
}
