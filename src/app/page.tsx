import MainCard from "@/components/main/MainCard";
import PricingCard from "@/components/main/PricingCard";
import Testimonials from "@/components/main/Testimonials";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Header2TagType {
  headerText: string;
}
const Header2Tag = ({ headerText }: Header2TagType) => {
  return (
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-xl capitalize">
      {headerText}
    </h2>
  );
};
interface LandingSectionType {
  id: string;
  headerText: string;
  children: React.ReactNode;
}
const LandingSection = ({ id, headerText, children }: LandingSectionType) => {
  return (
    <section
      className="scroll-mt-[250px] snap-start flex flex-col items-center px-4 gap-4 py-6"
      id={id}
    >
      <Header2Tag headerText={headerText} />
      {children}
    </section>
  );
};

export default function Home() {
  const cards = [
    {
      src: "/photo1.avif",
      alt: "examplImg",
      title: "1. Import sources",
      description:
        "Currently you can import YouTube playlists as a source. We are working to support single videos and channels. In the future you will be able to add content from X, Instagram and others.",
    },
    {
      src: "/photo1.avif",
      alt: "examplImg",
      title: "2. Wait for the process to finish",
      description:
        "Because we need to fetch content from provided sources it might take a few minutes for every time a certain piece of content is used. The second time will take only a few seconds",
    },
    {
      src: "/photo1.avif",
      alt: "examplImg",
      title: "3. Find what you want",
      description:
        "Now it's time for research. Use the search bard to find what you want. Choose between actual search and sematnic search. Peek at common topics and related materials",
    },
  ];
  return (
    <div className="flex flex-col gap-10">
      <main
        className="min-h-[400px] px-4 py-6 relative flex flex-col gap-6 justify-start items-center text-center"
        id="main"
      >
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold drop-shadow-xl capitalize w-full md:w-2/3">
          Make researching content easy{" "}
          <span className="lowercase">with an effective tool</span>
        </h1>
        <h2 className="text-lg font-medium w-full md:w-5/6 lg:w-3/5">
          <span className="font-bold lowercase">medialibrary</span> allows you
          to import Tweets, YouTube videos / playlists and other content to make
          <span className="font-semibold"> your research smooth&clean</span>
        </h2>
        <div className="flex flex-col gap-2 md:gap-6 md:flex-row">
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
      <LandingSection id="howitwokrs" headerText="How it works?">
        <div className="flex flex-col gap-4 md:flex-row xl:gap-10 items-baseline xl:px-10">
          {cards.map((card, key) => (
            <MainCard
              src={card.src}
              alt={card.alt}
              title={card.title}
              description={card.description}
              key={key}
            />
          ))}
        </div>
      </LandingSection>
      <LandingSection id="testimonials" headerText="Testimonials">
        <Testimonials />
      </LandingSection>
      <LandingSection headerText="Pricing" id="pricing">
        <div className="flex flex-col items-center justify-center gap-4 w-full my-4 md:flex-row">
          <PricingCard title="Weekly pass" type="weekly" price="10" />
          <PricingCard title="Monthly pass" type="monthly" price="35" />
        </div>
      </LandingSection>
      <LandingSection headerText="Contact us" id="contact">
        <Button variant="link">
          <Link href="mailto:jakub@test.com">
            You can always email me by using this link
          </Link>
        </Button>
      </LandingSection>
    </div>
  );
}
