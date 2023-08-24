import "./App.css";
import { 
  MantineProvider,
  Text,
  ActionIcon,
  ScrollArea,
  TextInput,
  Loader,
  Badge,
  Group
} from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { 
  IconNote,
  IconChevronLeft,
  IconPencil,
  IconTrash,
  IconDeviceFloppy
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import Editor from './Editor';

const example = "<h1>Hello, World!</h1>\n<p>Cheese</p>";
const defaultTitle = "New Note";

function getFiles() {
  let obj = Object.keys(window.localStorage).map(fn => {
    let saved = JSON.parse(window.localStorage.getItem(fn));
    return saved;
  })
  return obj;
}

export default function App() {
  const [navOpened, setNavOpened] = useState(true);
  const [value, setValue] = useDebouncedState(example, 200);
  const [initial, setInitial] = useState();
  const [id, setId] = useState(null);
  const [files, setFiles] = useState(getFiles());
  const [updates, setUpdates] = useState(0);
  const [title, setTitle] = useState(defaultTitle);
  const [loading, setLoading] = useState(false);

  function saveFile({
    filename,
    title,
    content
  }) {
    if (!filename)
      return

    let now = new Date()
    window.localStorage.setItem(filename, JSON.stringify({
      title,
      content,
      last: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      filename
    }))
    setFiles(getFiles());
  }

  function getFile(id) {
    return JSON.parse(window.localStorage.getItem(id))
  }

  useEffect(() => {
    if (!id)
      return
  
    saveFile({
      filename: id,
      title: title || "New Note",
      content: value
    });
  }, [value, title])

  useEffect(() => {
    if (!id)
      return

    let f = getFile(id);
    setValue(f.content);
    setInitial(f.content);
    setTitle(f.title);
    setUpdates(i => i + 1);
  }, [id])
  
  function NoteItem({
    title,
    preview,
    myId
  }) {
    return (
      <div
        className={"note-item" + (myId == id ? " this" : "")}
        onClick={() => {
          setId(myId);
          setNavOpened(false);
        }}
        >
        <div>
          <Text
            className="normal/h"
            fw="bold"
            fz="1.15rem"
            lineClamp={1}
            >{title}</Text>
          <Text c="dimmed" lineClamp={1}>{preview}</Text>
        </div>
      </div>
    )
  }

  return (
    <MantineProvider
      theme={{ colorScheme: 'dark' }}
      withCSSVariables
      withGlobalStyles
      withNormalizeCSS
      >
      <div
        className={"sidebar" + (navOpened ? "" : " closed")}
        >
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h1 className="w/icon">
            <span>
              <IconNote
                size={30}
                />
            </span>
            <span>Noteaway</span>
          </h1>
          <ActionIcon
            radius="xl"
            size="xl"
            color="blue"
            variant="light"
            onClick={() => {
              let _id = String(getFiles().length + 1);
              saveFile({
                filename: _id,
                title: "New Note",
                content: example
              });
              setId(null);
              setLoading(true);
              setNavOpened(false);
              setTimeout(() => {
                setLoading(false);
                setId(_id);
                setInitial(getFile(_id).content);
                setValue(getFile(_id).content);
              }, 500)
            }}
            >
            <IconPencil />
          </ActionIcon>
        </div>
        <ScrollArea
          h={500}
          >
          {
            files.length > 0 ? (
              <div className="note-item-list">
              {
                files.map(item => (
                  <NoteItem
                    title={item.title}
                    preview={item.last}
                    myId={item.filename}
                    />
                ))
              }
            </div>
            ) : (
              <Text c="dimmed">
                "If the wind is right you can sail away."<br />
                Click on <IconPencil size={15} /> to create a new note.
              </Text>
            )
          }
        </ScrollArea>
      </div>
      <div className="body">
        {
          (id !== null && !loading) ? (
            <>
              <div
                className="open-nav w/icon"
                onClick={() => setNavOpened(true)}
                >
                <IconChevronLeft />
                All notes
              </div>
              <TextInput
                placeholder="New Note"
                variant="unstyled"
                style={{
                  borderBottom: "1px solid #6b6e7680",
                  marginBottom: "25px"
                }}
                className="bolded"
                size="xl"
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
                icon={<IconPencil />}
              />


              <Group style={{
                marginBottom: "25px"
              }}>
                <Badge
                  color="red"
                  onClick={() => {
                    let ans = confirm("Are you sure you want to delete this note?");
                    if (!ans)
                      return
        
                    setFiles(getFiles());
                    setLoading(true);
                    setNavOpened(true);
                    
                    setTimeout(() => {
                      window.localStorage.removeItem(id);
                      setId(null);
                      setValue(null);
                      setInitial(null);
                      setLoading(false);
                      setFiles(getFiles());
                    }, 500)
                  }}
                  leftSection={
                    <IconTrash
                      style={{
                        display: "flex"
                      }}
                      size={18}
                      />
                  }
                  size="lg"
                  style={{ cursor: "pointer" }}
                  >
                  Delete
                </Badge>

                <Badge
                  color="purple"
                  size="lg"
                  style={{ cursor: "pointer" }}
                  leftSection={
                    <IconDeviceFloppy
                      style={{
                        display: "flex"
                      }}
                      size={18}
                      />
                  }
                  onClick={() => {
                    if (!id)
                      return
                  
                    saveFile({
                      filename: id,
                      title: title || "New Note",
                      content: value
                    });
                    alert("Saved :)")
                  }}
                  >
                  Save
                </Badge>
              </Group>
      
              <div data-updates={updates}>
                <Editor
                  setValue={setValue}
                  value={initial}
                  />
              </div>
            </>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: '90vh'
            }}>
              <h1>{
                loading ? "I'm loading :)" : "Nothin' here..."
              }</h1>
              <Text c="dimmed">{
                loading ? "Patience is the key" : "Open or create a new one!"
              }</Text>
              
              {
                loading && (
                  <>
                    <br />
                    <Loader />
                  </>
                )
              }
            </div>
          )
        }
      </div>
    </MantineProvider>
  )
}