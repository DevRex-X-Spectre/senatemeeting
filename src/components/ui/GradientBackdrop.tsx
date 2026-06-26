import { cn } from "@/lib/utils/cn";

interface GradientBackdropProps {
  className?: string;
  variant?: "marketing" | "subtle";
}

/**
 * Decorative gradient blob backdrop — atmospheric only.
 * Used behind marketing hero content. Never on functional UI.
 */
export function GradientBackdrop({ className, variant = "marketing" }: GradientBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {variant === "marketing" ? (
        <>
          <span
            className="gradient-blob"
            style={{
              top: "-10%",
              right: "-5%",
              width: "520px",
              height: "520px",
              background:
                "radial-gradient(circle at 30% 30%, #e55cff 0%, transparent 65%)",
            }}
          />
          <span
            className="gradient-blob"
            style={{
              top: "20%",
              right: "10%",
              width: "420px",
              height: "420px",
              background:
                "radial-gradient(circle at 50% 50%, #8247f5 0%, transparent 65%)",
            }}
          />
          <span
            className="gradient-blob"
            style={{
              top: "40%",
              right: "-10%",
              width: "360px",
              height: "360px",
              background:
                "radial-gradient(circle at 60% 60%, #ffa600 0%, transparent 65%)",
              opacity: 0.4,
            }}
          />
          <span
            className="gradient-blob"
            style={{
              top: "5%",
              left: "40%",
              width: "320px",
              height: "320px",
              background:
                "radial-gradient(circle at 50% 50%, #0099ff 0%, transparent 65%)",
              opacity: 0.35,
            }}
          />
        </>
      ) : (
        <span
          className="gradient-blob"
          style={{
            top: "-20%",
            left: "30%",
            width: "320px",
            height: "320px",
            background:
              "radial-gradient(circle at 50% 50%, #e55cff 0%, transparent 65%)",
            opacity: 0.25,
          }}
        />
      )}
    </div>
  );
}