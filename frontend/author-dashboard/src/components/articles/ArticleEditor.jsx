import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Undo2,
  Redo2,
  Highlighter,
  RemoveFormatting,
  Heading1,
  Heading2,
  Pilcrow,
} from "lucide-react";

function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center h-9 min-w-9 px-2 rounded-md text-sm transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-200/80"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-6 bg-slate-300 mx-1 self-center" />;
}

function ArticleEditor({ content, setContent }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Image,
      Youtube.configure({ controls: true, nocookie: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: content || "",
    onUpdate: ({ editor: ed }) => {
      setContent(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "ProseMirror min-h-[480px] p-5 md:p-6 focus:outline-none prose prose-slate max-w-none",
      },
    },
  });

  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="border rounded-xl bg-white p-6 text-slate-500">
        Loading editor…
      </div>
    );
  }

  const addLink = () => {
    const previous = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt("Enter YouTube URL");
    if (url) {
      editor
        .chain()
        .focus()
        .setYoutubeVideo({ src: url, width: 640, height: 400 })
        .run();
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2.5 border-b border-slate-200 bg-slate-50">
        <select
          className="h-9 border border-slate-200 rounded-md px-2 text-sm bg-white"
          value={
            editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
                ? "2"
                : editor.isActive("heading", { level: 3 })
                  ? "3"
                  : "0"
          }
          onChange={(e) => {
            const level = Number(e.target.value);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level }).run();
          }}
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <select
          className="h-9 border border-slate-200 rounded-md px-2 text-sm bg-white"
          onChange={(e) => {
            if (!e.target.value) return;
            editor.chain().focus().setFontFamily(e.target.value).run();
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Font
          </option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
        </select>

        <Divider />

        <ToolbarButton
          title="Paragraph"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} />
        </ToolbarButton>

        <label className="inline-flex items-center gap-1 h-9 px-2 rounded-md hover:bg-slate-200/80 cursor-pointer" title="Text color">
          <span className="text-xs font-semibold text-slate-600">A</span>
          <input
            type="color"
            className="w-6 h-6 border-0 bg-transparent cursor-pointer"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </label>

        <ToolbarButton
          title="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Insert link" active={editor.isActive("link")} onClick={addLink}>
          <Link2 size={16} />
        </ToolbarButton>
        <ToolbarButton title="Insert image" onClick={addImage}>
          <ImageIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Embed YouTube" onClick={addYoutube}>
          <Video size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Insert table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TableIcon size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Clear formatting"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <RemoveFormatting size={16} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

export default ArticleEditor;
