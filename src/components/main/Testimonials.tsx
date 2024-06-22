// components/Testimonials.tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AutoScroll from "embla-carousel-auto-scroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import React from "react";

const getAcronym = (name: string) =>
  name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

interface TestimonialCardProps {
  name: string;
  image: string;
  opinion: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  image,
  opinion,
}) => {
  return (
    <div className="shadow-lg rounded-xl flex flex-col items-start gap-2 w-full py-4 px-4 h-full max-h-[150px] border-2 border-gray-300">
      <div className="flex flex-row gap-2 items-center justify-center">
        <Avatar>
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{getAcronym(name)}</AvatarFallback>
        </Avatar>
        <span className="font-bold text-lg">{name}</span>
      </div>
      <p className="font-semibold text-sm overflow-hidden w-full">{opinion}</p>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const testimonials: TestimonialCardProps[] = [
    {
      name: "Adam Knot",
      image:
        "https://yt3.ggpht.com/OHHbAdLYxh-6QBbaaI0OWzSEeGu02Kw8Scx1EI9LYHb_yyehTlPxzGYl2ADiItynMvB7j6ZY=s68-c-k-c0x00ffffff-no-rj",
      opinion: "Very good nice",
    },
    {
      name: "Bethany Clark",
      image:
        "https://yt3.ggpht.com/I3x84cuDVUoh8mj5TAE08R6ieGwTvfCxX5_iT4nQYtQfdCgULbaqIifIDfb8tj9n_ho9w6b00g=s68-c-k-c0x00ffffff-no-rj",
      opinion: "Exceptional service!",
    },
    {
      name: "Charlie Smith",
      image:
        "https://yt3.ggpht.com/OHHbAdLYxh-6QBbaaI0OWzSEeGu02Kw8Scx1EI9LYHb_yyehTlPxzGYl2ADiItynMvB7j6ZY=s68-c-k-c0x00ffffff-no-rj",
      opinion: "Highly recommended!",
    },
    {
      name: "Bethany Clark",
      image:
        "https://yt3.ggpht.com/I3x84cuDVUoh8mj5TAE08R6ieGwTvfCxX5_iT4nQYtQfdCgULbaqIifIDfb8tj9n_ho9w6b00g=s68-c-k-c0x00ffffff-no-rj",
      opinion:
        "Exceptional service! What the fuck? How does it even work? How does it even work? How does it even work? How",
    },
  ];

  return (
    <Carousel
      plugins={[
        AutoScroll({
          speed: 2,
          stopOnMouseEnter: true,
          playOnInit: true,
          stopOnInteraction: false,
          startDelay: 0,
        }),
      ]}
      className="w-full flex-col flex gap-2 py-4"
      opts={{
        loop: true,
        align: "start",
      }}
    >
      <CarouselContent className="w-full py-4">
        {testimonials.map(
          ({ name, opinion, image }: TestimonialCardProps, index) => (
            <CarouselItem className="md:basis-1/4 lg:basis-1/3" key={index}>
              <TestimonialCard name={name} opinion={opinion} image={image} />
            </CarouselItem>
          )
        )}
      </CarouselContent>
    </Carousel>
  );
};

export default Testimonials;
