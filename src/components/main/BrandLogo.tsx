import Link from "next/link";
import { Button } from "../ui/button";
import { Library } from "lucide-react";

interface BrandLogoProps {
  variant: "light" | "dark";
}
const BrandLogo = ({ variant }: BrandLogoProps) => {
  if (variant === "light") {
    return (
      <Button variant="link" className="text-lg font-semibold" asChild>
        <Link
          href="/"
          className="flex items-center gap-1 lowercase text-foreground"
        >
          <Library size={20} />
          MediaLibrary
        </Link>
      </Button>
    );
  } else if (variant === "dark") {
    return (
      <Button
        variant="link"
        className="text-lg font-semibold text-foreground"
        asChild
      >
        <Link
          href="/"
          className="flex items-center gap-1 lowercase text-background"
        >
          <Library size={20} />
          MediaLibrary
        </Link>
      </Button>
    );
  }
};

export default BrandLogo;
