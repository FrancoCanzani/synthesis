import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/core";
import { BookOpen, HighlighterIcon } from "lucide-react";
import { useSearchParams } from "react-router";
import { ToggleReaderThemeButton } from "./toggle-reader-theme-button";
import { Button } from "./ui/button";

const NoteEditorSideMenuButton = ({
  icon: Icon,
  label,
  className,
  onClick,
  isActive,
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", className, isActive && "bg-accent")}
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

export default function NoteEditorSideMenu({ editor }: { editor: Editor }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const editorMode = searchParams.get("editorMode");

  return (
    <div className="fixed bottom-12 right-9 z-50 flex flex-col items-center space-y-2 rounded-md border bg-transparent p-1 opacity-50 transition-opacity duration-300 ease-in-out hover:bg-background hover:opacity-100 lg:bottom-1/2 lg:translate-y-1/4 lg:bg-background lg:opacity-100">
      <NoteEditorSideMenuButton
        icon={BookOpen}
        label="Enter read mode"
        isActive={editorMode === "read"}
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
      <ToggleReaderThemeButton />
      <NoteEditorSideMenuButton
        icon={HighlighterIcon}
        label="Highlight"
        isActive={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      />
    </div>
  );
}
