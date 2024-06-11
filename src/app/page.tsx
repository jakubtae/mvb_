import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main
        className="px-20 relative flex flex-col pt-20 pb-[256px] gap-4"
        id="main"
      >
        <h1 className="text-7xl font-extrabold text-wrap">
          {/* Better YouTube <br /> search - find exactly <br /> what you need */}
          Find what you <br />
          need on YouTube <br />
          {/* <Image src="yt_logo.svg" alt="YT" width={100} height={20} /> */}
          without wasting time
        </h1>
        <Link href="/auth/register">
          <Button className="font-semibold text-lg" size="lg">
            Start now
          </Button>
        </Link>
        <Image
          src="./back_pattern.svg"
          width={400}
          height={300}
          alt="sbg"
          className="absolute top-0 right-0 pointer-events-none	"
        />
        <Image
          src="./back_pattern.svg"
          width={400}
          height={300}
          alt="sbg"
          className="absolute left-0 bottom-0 rotate-180 pointer-events-none	"
        />
      </main>
      <article className="bg-black text-white flex flex-col items-center gap-4 p-20">
        <h2 className="font-bold text-6xl capitalize">
          Simple but effective tool
        </h2>
        <div className="flex justify-center gap-x-20 items-center px-20">
          {/* <Image
            src="./yt_logo.svg"
            width={200}
            height={200}
            alt="YouTube Logo"
            className="p-10 bg-beige rounded-md transition-transform hover:scale-105 pointer duration-200 h-fit"
          /> */}
          <div className="flex flex-col gap-y-4 w-1/2">
            <h3 className="capitalize text-3xl font-semibold">
              Three simple steps
            </h3>
            <div className="flex flex-col gap-y-1">
              <h4 className="capitalize text-lg font-semibold">
                1. Import a source
              </h4>
              <p>
                Be it a playlist or a channel, or both. Just paste the link.
              </p>
            </div>
            <div className="flex flex-col gap-y-1">
              <h4 className="capitalize text-lg font-semibold">
                2. Wait for it to load.
              </h4>
              <p>
                Since we prefer quality over speed you unfotunately have to wait
                a few minutes before all videos load. If a video from your
                sources has already been used even once it will be immediatly
                ready.
              </p>
            </div>
            <div className="flex flex-col gap-y-1">
              <h4 className="capitalize text-lg font-semibold">3. Search</h4>
              <p>
                Using our Search Engines you can specify what exactly you want
                to look for. A specific word to word moment? A certain topic?{" "}
                <br />
                <span className="font-semibold">
                  It's all posible thanks to our Search Engine
                </span>
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
