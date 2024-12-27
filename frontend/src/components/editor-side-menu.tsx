import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/core";
import { Bold, BookOpen, Italic, List } from "lucide-react";
import { useSearchParams } from "react-router";
import { Button } from "./ui/button";

const EditorSideMenuButton = ({
  icon: Icon,
  label,
  className,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
  onClick?: () => void;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", className)}
        onClick={onClick}
      >
        <Icon className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="left">
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

export default function EditorSideMenu({ editor }: { editor: Editor }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const editorMode = searchParams.get("editorMode");

  return (
    <div className="fixed bottom-12 right-9 z-50 flex flex-col items-center space-y-2 rounded-md border bg-background p-1 opacity-50 transition-opacity duration-300 ease-in-out hover:opacity-100 lg:bottom-1/2 lg:translate-y-1/4 lg:opacity-100">
      <EditorSideMenuButton
        icon={BookOpen}
        label="Enter read mode"
        className={cn(editorMode === "read" && "bg-accent")}
        onClick={() => {
          if (editorMode === "read") {
            setSearchParams({ editorMode: "edit" });
            editor.setEditable(true);
          } else {
            setSearchParams({ editorMode: "read" });
            editor.setEditable(false);
          }
        }}
      />
      <EditorSideMenuButton icon={Bold} label="Bold" />
      <EditorSideMenuButton icon={Italic} label="Italic" />
      <EditorSideMenuButton icon={List} label="List" />
    </div>
  );
}
