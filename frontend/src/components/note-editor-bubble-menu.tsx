import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BubbleMenu, Editor } from "@tiptap/react";
import {
  AlignLeft,
  BookOpen,
  Expand,
  FileText,
  Pencil,
  PenLine,
  Wand2,
} from "lucide-react";
import React, { useEffect, useState } from "react";

type QuickPrompt = {
  title: string;
  prompt: string;
  icon: React.ReactNode;
  insertMode: "replace" | "after";
};

const quickPrompts: QuickPrompt[] = [
  {
    title: "Summarize",
    prompt: "Summarize this text concisely",
    icon: <FileText className="h-4 w-4" />,
    insertMode: "replace",
  },
  {
    title: "Expand",
    prompt: "Expand on this topic with more details",
    icon: <Expand className="h-4 w-4" />,
    insertMode: "after",
  },
  {
    title: "Rewrite",
    prompt: "Rewrite this text to make it more engaging",
    icon: <PenLine className="h-4 w-4" />,
    insertMode: "replace",
  },
  {
    title: "Improve",
    prompt: "Improve this text by making it clearer and more professional",
    icon: <Wand2 className="h-4 w-4" />,
    insertMode: "replace",
  },
  {
    title: "Simplify",
    prompt: "Make this text simpler and easier to understand",
    icon: <AlignLeft className="h-4 w-4" />,
    insertMode: "replace",
  },
  {
    title: "Explain",
    prompt: "Explain this concept in detail with examples",
    icon: <BookOpen className="h-4 w-4" />,
    insertMode: "after",
  },
  {
    title: "Continue",
    prompt: "Continue writing in the same style and context",
    icon: <Pencil className="h-4 w-4" />,
    insertMode: "after",
  },
];

const API_URL = import.meta.env.VITE_API_URL;

export function NoteEditorBubbleMenu({ editor }: { editor: Editor }) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSelectedText, setLastSelectedText] = useState("");
  const [selectionFrom, setSelectionFrom] = useState<number | null>(null);
  const [selectionTo, setSelectionTo] = useState<number | null>(null);

  useEffect(() => {
    const updateSelectedText = () => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);

      if (text) {
        setLastSelectedText(text);
        setSelectionFrom(from);
        setSelectionTo(to);
      }
    };

    editor.on("selectionUpdate", updateSelectedText);
    return () => {
      editor.off("selectionUpdate", updateSelectedText);
    };
  }, [editor]);

  const handleRequest = async (prompt: string, mode: "replace" | "after") => {
    if (!lastSelectedText && mode === "replace") return;

    setIsLoading(true);
    const textToProcess = lastSelectedText || editor.getText();
    const from = selectionFrom || 0;
    const to = selectionTo || 0;

    try {
      const response = await fetch(`${API_URL}/ai/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${prompt}\n${textToProcess}`,
          content: editor.getText(),
          messages: [],
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        if (mode === "replace" && lastSelectedText) {
          editor.chain().focus().deleteRange({ from, to }).run();
        }

        const insertPosition = mode === "replace" ? from : to + 2;

        if (mode === "after") {
          editor
            .chain()
            .focus()
            .insertContentAt(insertPosition - 2, "\n")
            .run();
        }

        let isFirstChunk = true;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            editor
              .chain()
              .focus()
              .insertContentAt(
                insertPosition +
                  (isFirstChunk
                    ? 0
                    : editor.state.doc.textBetween(
                        insertPosition,
                        editor.state.doc.content.size,
                      ).length),
                chunk,
              )
              .run();
            isFirstChunk = false;
          }
        }

        // After the streaming is complete, get the inserted content and format it
        const insertedContent = editor.state.doc.textBetween(
          insertPosition,
          editor.state.doc.content.size,
        );

        const formattedContent = insertedContent
          .split("\n")
          .filter((text) => text !== "")
          .map((text) => `<p>${text}</p>`)
          .join("");

        // Replace the streamed content with the formatted version
        editor
          .chain()
          .focus()
          .deleteRange({
            from: insertPosition,
            to: editor.state.doc.content.size,
          })
          .insertContentAt(insertPosition, formattedContent)
          .run();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="flex items-center rounded-md border bg-background p-0.5 text-sm shadow-md"
    >
      <div className="flex flex-wrap items-center gap-0.5">
        {quickPrompts.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRequest(item.prompt, item.insertMode)}
                className="h-8"
                disabled={isLoading}
              >
                {item.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px]">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.prompt}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </BubbleMenu>
  );
}
