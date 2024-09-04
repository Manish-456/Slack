import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef } from "react";
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
}

export function ChatInput({ placeholder }: ChatInputProps) {
  const editorRef = useRef<Quill | null>(null);
  return (
    <div className="px-5 w-full">
      <Editor
        onSubmit={() => {}}
        disabled={false}
        innerRef={editorRef}
        placeholder={placeholder}
      />
    </div>
  );
}
