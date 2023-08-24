import { 
  Popover,
  TextInput,
  Button,
  Badge,
  Group,
  ScrollArea
} from '@mantine/core'
import { 
  RichTextEditor,
  Link,
  useRichTextEditorContext,
} from '@mantine/tiptap';
import { 
  useEditor,
  FloatingMenu,
  BubbleMenu
} from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import tsLanguageSyntax from 'highlight.js/lib/languages/typescript';
import pyLanguageSyntax from 'highlight.js/lib/languages/python';
import { 
  IconFileCode, 
  IconBrandOpenai
} from '@tabler/icons-react'
import { useEffect, useState } from 'react';
import axios from 'axios';

lowlight.registerLanguage('ts', tsLanguageSyntax);
lowlight.registerLanguage('py', pyLanguageSyntax);

function InsertStarControl() {
  const { editor } = useRichTextEditorContext();
  const [content, setContent] = useState();
  const [loading, setLoading] = useState(false);
  const badgeProps = {
    styles: {
      root: {
        textTransform: "none",
        cursor: "pointer",
        transition: "all 200ms ease",
        "&:hover": {
          filter: "brightness(1.5)"
        }
      }
    }
  }

  function ExampleUsage({
    label,
    asContent
  }) {
    return (
      <Badge 
        {...badgeProps}
        onClick={() => setContent(asContent)}
        >{label}</Badge>
    )
  }

  return (
    <Popover width={350}>
      <Popover.Target>
        <RichTextEditor.Control
          aria-label="Ask ChatGPT"
          title="Ask ChatGPT"
        >
          <IconBrandOpenai stroke={1.5} size="1rem" />
        </RichTextEditor.Control>

      </Popover.Target>
      <Popover.Dropdown>
        <TextInput
          placeholder="Brainstorm: 5 ideas to boost my productivity"
          value={content}
          onChange={(event) => setContent(event.currentTarget.value)}
          disabled={loading}
          />
        <div style={{ 
          marginTop: "15px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <ScrollArea w={200}>
            <Group>
              <ExampleUsage
                label="Brainstorm"
                asContent="Brainstorm: list 10 ideas on how to boost my productivity"
                />
              <ExampleUsage
                label="Write Code"
                asContent="Write a simple Python Hello, World!"
                />
            </Group>
          </ScrollArea>
          <Button
            variant="gradient"
            gradient={{ from: 'teal', to: 'blue', deg: 60 }}
            radius="lg"
            loading={loading}
            disabled={!content}
            onClick={() => {
              setLoading(true);
              fetch("https://gpt4free.awdev.repl.co/chat", {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                  "Content-Type": "application/json",
                },
                redirect: "follow",
                body: JSON.stringify({
                  messages: [
                    {
                      role: "user",
                      content
                    }
                  ]
                }),
              })
                // Retrieve its body as ReadableStream
                .then((response) => {
                  const reader = response.body.getReader();
                  return new ReadableStream({
                    start(controller) {
                      return pump();
                      function pump() {
                        return reader.read().then(({ done, value }) => {
                          if (done) {
                            controller.close();
                            return;
                          }
                          controller.enqueue(value);
  
                          editor?.commands.focus('end')
                          
                          let text = new TextDecoder().decode(value)
                          editor?.commands.insertContent(
                            text
                              .replaceAll("\n", "<br />")
                          );
                          
                          return pump();
                        });
                      }
                    },
                  });
                })
                // Create a new response out of the stream
                .then((stream) => new Response(stream))
                // Create an object URL for the response
                .then((response) => response.blob())
                .then((blob) => URL.createObjectURL(blob))
                // finished
                .then((url) => {
                  setLoading(false);
                  setContent();
                  console.log("blob url:", url)
                })
                /*.catch((err) => console.error(err));*/
            }}
            >
            Ask Away
          </Button>
        </div>
  
      </Popover.Dropdown>
    </Popover>
  );
}

export default function Editor({ setValue, value }) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        Link,
        Superscript,
        SubScript,
        Highlight,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({
          placeholder: "Write something down, or tell me a story!"
        }),
        CodeBlockLowlight.configure({
          lowlight,
        }),
      ],
      content: value,

      // events & stuff
      onUpdate({ editor }) {
        setValue(editor.getHTML())
      }
    }
  );

  useEffect(() => {
    editor?.commands.setContent(value);
  }, [editor, value]);

  return (
    <RichTextEditor
      editor={editor}
      >
      <RichTextEditor.Toolbar sticky>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
          <RichTextEditor.CodeBlock
            icon={IconFileCode}
            />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      {/* main contents */}
      {editor && (
        <BubbleMenu editor={editor}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Link />
          </RichTextEditor.ControlsGroup>
        </BubbleMenu>
      )}
  
      {editor && (
        <FloatingMenu editor={editor}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.BulletList />
            <InsertStarControl />
          </RichTextEditor.ControlsGroup>
        </FloatingMenu>
      )}
      
      <RichTextEditor.Content />
    </RichTextEditor>
  );
}