import { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends ButtonProps {
  onClick: () => void;
  className?: string;
  children: ReactNode;
  tooltipContent: string;
}

export default function ActionButton({
  onClick,
  className,
  children,
  tooltipContent,
  ...props
}: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 hover:bg-accent", className)}
          onClick={onClick}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>{tooltipContent}</span>
      </TooltipContent>
    </Tooltip>
  );
}
