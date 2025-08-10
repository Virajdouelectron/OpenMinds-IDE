"use client"

import * as React from "react"
import Editor, { type OnMount } from "@monaco-editor/react"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import { MonacoBinding } from "y-monaco"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Send, PlugZap, Plug } from "lucide-react"

type CodeEditorProps = {
  defaultLanguage?: "python" | "r" | "javascript" | "typescript"
  defaultValue?: string
  height?: string | number
  roomId?: string
  onConnectionChange?: (connected: boolean) => void
}

function randomName() {
  const adj = ["calm", "brave", "smart", "rapid", "eager", "gentle", "bold", "mighty"]
  const animal = ["tiger", "eagle", "panda", "otter", "orca", "lynx", "koala", "dolphin"]
  return `${adj[Math.floor(Math.random() * adj.length)]}-${animal[Math.floor(Math.random() * animal.length)]}`
}

function randomColor() {
  const colors = ["#10b981", "#14b8a6", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e", "#a3e635"]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function CodeEditor({
  defaultLanguage = "python",
  defaultValue = "",
  height = "60vh",
  roomId = "openminds-demo",
  onConnectionChange,
}: CodeEditorProps) {
  const [language, setLanguage] = React.useState(defaultLanguage)
  const [value, setValue] = React.useState(defaultValue)
  const [username] = React.useState(randomName())
  const [color] = React.useState(randomColor())
  const [connected, setConnected] = React.useState(true)
  const [chatInput, setChatInput] = React.useState("")
  const editorRef = React.useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null)

  // Yjs collaboration
  const ydocRef = React.useRef<Y.Doc | null>(null)
  const providerRef = React.useRef<WebsocketProvider | null>(null)
  const yTextRef = React.useRef<Y.Text | null>(null)
  const bindingRef = React.useRef<MonacoBinding | null>(null)
  const yChatRef = React.useRef<Y.Array<{ user: string; color: string; text: string; ts: number }> | null>(null)
  const [messages, setMessages] = React.useState<{ user: string; color: string; text: string; ts: number }[]>([])

  const setupCollab = React.useCallback(() => {
    if (!roomId) return
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider(
      // Public demo server for Yjs websockets:
      "wss://demos.yjs.dev",
      `openminds-${roomId}`,
      ydoc,
    )
    provider.on("status", (e: any) => {
      setConnected(e.status === "connected")
      onConnectionChange?.(e.status === "connected")
    })
    const ytext = ydoc.getText("monaco")
    const ychat = ydoc.getArray<{ user: string; color: string; text: string; ts: number }>("chat")
    ydocRef.current = ydoc
    providerRef.current = provider
    yTextRef.current = ytext
    yChatRef.current = ychat
    provider.awareness.setLocalStateField("user", { name: username, color })
    const chatObserver = () => {
      setMessages([...ychat.toArray()].sort((a, b) => a.ts - b.ts))
    }
    ychat.observe(chatObserver)
    // Initialize chat state
    chatObserver()
  }, [roomId, username, color, onConnectionChange])

  React.useEffect(() => {
    setupCollab()
    return () => {
      bindingRef.current?.destroy()
      providerRef.current?.destroy()
      ydocRef.current?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    // Initialize with defaultValue if no Yjs content yet
    if (yTextRef.current && yTextRef.current.length === 0 && defaultValue) {
      yTextRef.current.insert(0, defaultValue)
    }
    // Bind Monaco to Yjs
    if (yTextRef.current && providerRef.current) {
      const binding = new MonacoBinding(
        yTextRef.current,
        editor.getModel()!,
        new Set([editor]),
        providerRef.current.awareness,
      )
      bindingRef.current = binding
    }
    // Basic editor options
    editor.updateOptions({
      minimap: { enabled: false },
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 13,
      scrollBeyondLastLine: false,
      tabSize: 2,
      automaticLayout: true,
    })
  }

  const sendMessage = () => {
    const text = chatInput.trim()
    if (!text || !yChatRef.current) return
    yChatRef.current.push([{ user: username, color, text, ts: Date.now() }])
    setChatInput("")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Collaborative Editor</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
              <SelectTrigger className="h-8 w-36">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="r">R</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
              </SelectContent>
            </Select>
            <Badge
              variant={connected ? "default" : "secondary"}
              className={cn(connected ? "bg-emerald-600 hover:bg-emerald-600 text-white" : "")}
            >
              {connected ? (
                <>
                  <PlugZap className="mr-1 h-3.5 w-3.5" /> Connected
                </>
              ) : (
                <>
                  <Plug className="mr-1 h-3.5 w-3.5" /> Offline
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Editor
            height={height as any}
            defaultLanguage={language}
            language={language}
            theme="vs-dark" // Next Themes will invert overall; Monaco theme is set here
            onChange={(v) => setValue(v ?? "")}
            onMount={onMount}
            options={{}}
          />
          <div className="mt-2 text-xs text-muted-foreground">
            {"Tip: Switch to JavaScript/TypeScript to run code in Notebook cells."}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Room</CardTitle>
            <div className="text-xs text-muted-foreground">
              {"Share the same Room ID with teammates to collaborate."}
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <div>{username}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[calc(100%-0px)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Chat</CardTitle>
            <div className="text-xs text-muted-foreground">{"Messages sync within the collaboration room."}</div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 h-[50vh]">
            <ScrollArea className="flex-1 rounded-md border p-2">
              <div className="space-y-2">
                {messages.map((m, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium" style={{ color: m.color }}>
                      {m.user}
                    </span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span>{m.text}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type message"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" ? sendMessage() : null)}
              />
              <Button onClick={sendMessage} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
