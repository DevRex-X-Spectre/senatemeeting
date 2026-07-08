import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface AppLogoProps {
  className?: string;
  priority?: boolean;
}

export function AppLogo({ className, priority = false }: AppLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-pure-white p-0.5",
        className,
      )}
    >
      <Image
        src="/naub-logo.png"
        alt="Nigerian Army University Biu crest"
        width={96}
        height={82}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
