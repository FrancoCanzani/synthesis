import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/core";
import { BotMessageSquare } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import AddArticleDialog from "./articles/add-article-dialog";
import PublishNoteDialog from "./publish-note-dialog";
import { SearchAndReplaceToolbar } from "./toolbars/search-and-replace-toolbar";
import { TextToSpeechToolbar } from "./toolbars/text-to-speech";
import { ToolbarProvider } from "./toolbars/toolbar-provider";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function NoteEditorHeader({
  editor,
  rightSidebarOpen,
  setRightSidebarOpen,
}: {
  editor: Editor;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <header className="flex w-full items-center justify-between space-x-2 border-b bg-background px-2 py-1.5">
      <div className="flex items-center justify-start space-x-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
      </div>
      <div className="flex items-center justify-end space-x-1">
        <ToolbarProvider editor={editor}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 hover:bg-accent/50",
                  rightSidebarOpen && "bg-accent/50",
                )}
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              >
                <BotMessageSquare className="h-4 w-4" />
                <span className="sr-only">AI Assistant</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>AI Assistant</span>
            </TooltipContent>
          </Tooltip>
          <AddArticleDialog />
          <TextToSpeechToolbar />
          <SearchAndReplaceToolbar />
          <PublishNoteDialog />
        </ToolbarProvider>
      </div>
    </header>
  );
}
