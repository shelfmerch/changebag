
import React from "react";
import { cn } from "@/lib/utils";
import { Loader, LucideProps } from "lucide-react";

interface SpinnerProps extends Omit<LucideProps, "ref"> {
  className?: string;
}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Loader className={cn("h-4 w-4 animate-spin", className)} {...props} />
  );
}
