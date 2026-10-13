import { cn } from "@/lib/utils";

const widths = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
} as const;

interface PageContainerProps extends React.ComponentProps<"div"> {
  width?: keyof typeof widths;
}

/** Centred page column with the shared gutter. */
export function PageContainer({
  width = "default",
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[width], className)}
      {...props}
    />
  );
}

interface SectionProps extends React.ComponentProps<"section"> {
  tone?: "plain" | "muted";
}

/** Vertical rhythm for a page band: py-12 on mobile, py-16 from sm up. */
export function Section({ tone = "plain", className, ...props }: SectionProps) {
  return (
    <section
      className={cn("py-12 sm:py-16", tone === "muted" && "bg-muted/50", className)}
      {...props}
    />
  );
}
