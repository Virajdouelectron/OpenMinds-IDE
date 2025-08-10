"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CodeEditor } from "@/components/code-editor"
import { Notebook } from "@/components/notebook"
import { DatasetUploader } from "@/components/dataset-uploader"
import { TrainingDashboard } from "@/components/training-dashboard"
import { TestAndDeploy } from "@/components/test-and-deploy"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users, Play, PauseCircle } from "lucide-react"

export default function Page() {
  const [tab, setTab] = React.useState("editor")
  const [roomId, setRoomId] = React.useState("openminds-demo")
  const [connected, setConnected] = React.useState(true)
  const [trainingRunning, setTrainingRunning] = React.useState(false)

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex items-center gap-2 border-b">
          <div className="flex items-center px-3 py-2 gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="hidden md:flex">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="notebook">Notebook</TabsTrigger>
                <TabsTrigger value="datasets">Datasets</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="deploy">Test & Deploy</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="ml-auto flex items-center gap-2 pr-3">
            <div className="hidden lg:flex items-center gap-2">
              <Users className="h-4 w-4 opacity-70" />
              <Input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Room ID"
                className="h-8 w-40"
              />
              <Badge
                variant={connected ? "default" : "secondary"}
                className={cn(connected ? "bg-emerald-500 hover:bg-emerald-500 text-white" : "")}
              >
                {connected ? "Connected" : "Offline"}
              </Badge>
            </div>
            <ModeToggle />
          </div>
        </header>

        <main className="flex-1 p-3 md:p-6">
          <div className="md:hidden mb-3">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="notebook">Notebook</TabsTrigger>
              </TabsList>
              <div className="mt-2" />
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="datasets">Datasets</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="deploy">Deploy</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {tab === "editor" && (
            <div className="flex flex-col gap-3">
              <CodeEditor
                defaultLanguage="python"
                defaultValue={
                  "# Collaborative ML editor\n" +
                  "# Try switching language to 'javascript' to run code in the browser.\n" +
                  "import numpy as np  # (placeholder)\n" +
                  "print('Welcome to OpenMinds!')\n"
                }
                roomId={roomId}
                onConnectionChange={setConnected}
                height="70vh"
              />
            </div>
          )}

          {tab === "notebook" && <Notebook />}

          {tab === "datasets" && <DatasetUploader />}

          {tab === "dashboard" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setTrainingRunning((r) => !r)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {trainingRunning ? <PauseCircle className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {trainingRunning ? "Pause Training" : "Start Training"}
                </Button>
                <span className="text-sm text-muted-foreground">Simulated training loop for demo purposes</span>
              </div>
              <TrainingDashboard autoRun={trainingRunning} />
            </div>
          )}

          {tab === "deploy" && <TestAndDeploy />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
