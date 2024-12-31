import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/lib/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Glasses } from "lucide-react";
import { Button } from "./ui/button";

export const ToggleReaderThemeButton = ({
  className,
}: {
  className?: string;
}) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme !== "reader") {
      setTheme("reader");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            className,
            theme === "reader" && "bg-accent",
          )}
          onClick={toggleTheme}
        >
          <Glasses className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>{theme === "reader" ? "Exit reader theme" : "Enter reader theme"}</p>
      </TooltipContent>
    </Tooltip>
  );
};
