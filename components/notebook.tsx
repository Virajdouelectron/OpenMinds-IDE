"use client"

import * as React from "react"
import Editor from "@monaco-editor/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Play, Plus, Trash2 } from "lucide-react"

type Cell =
  | { id: string; type: "markdown"; content: string }
  | {
      id: string
      type: "code"
      language: "javascript" | "typescript" | "python" | "r"
      content: string
      outputs: OutputItem[]
      plots: PlotSeries[]
    }

type OutputItem = { type: "text"; content: string } | { type: "error"; content: string }

type PlotSeries = { id: string; label: string; color?: string; data: { x: number; y: number }[] }

function newId() {
  return Math.random().toString(36).slice(2)
}

export function Notebook() {
  const [cells, setCells] = React.useState<Cell[]>([
    {
      id: newId(),
      type: "markdown",
      content: "## Notebook\n- Add cells\n- Run JS/TS code inline\n- Plot with plot([{x,y}], { label })",
    },
    {
      id: newId(),
      type: "code",
      language: "javascript",
      content:
        "// Example: generate data and plot\n" +
        "const points = Array.from({length: 50}, (_, i) => ({ x: i, y: Math.sin(i/5) + Math.random()*0.2 }))\n" +
        "plot(points, { label: 'sin noisy', color: '#10b981' })\n" +
        "console.log('Generated', points.length, 'points')\n",
      outputs: [],
      plots: [],
    },
  ])

  const addCell = (type: Cell["type"]) => {
    setCells((prev) => [
      ...prev,
      type === "markdown"
        ? { id: newId(), type, content: "" }
        : { id: newId(), type: "code", language: "javascript", content: "", outputs: [], plots: [] },
    ])
  }

  const removeCell = (id: string) => {
    setCells((prev) => prev.filter((c) => c.id !== id))
  }

  const runCell = async (cell: Cell) => {
    if (cell.type !== "code") return
    // Only run JS/TS in-browser for safety. Python/R would require a backend or Pyodide.
    if (cell.language === "javascript" || cell.language === "typescript") {
      const outputs: OutputItem[] = []
      const plots: PlotSeries[] = []
      const xCounter = 0
      const api = {
        plot: (data: { x: number; y: number }[], config?: { label?: string; color?: string }) => {
          plots.push({ id: newId(), label: config?.label || "series", color: config?.color, data })
        },
        console: {
          log: (...args: any[]) => outputs.push({ type: "text", content: args.map((a) => String(a)).join(" ") }),
        },
      }
      try {
        const fn = new Function("plot", "console", cell.content)
        // @ts-ignore
        await fn(api.plot, api.console)
        setCells((prev) => prev.map((c) => (c.id === cell.id ? { ...c, outputs, plots } : c)))
      } catch (e: any) {
        outputs.push({ type: "error", content: e?.message || String(e) })
        setCells((prev) => prev.map((c) => (c.id === cell.id ? { ...c, outputs, plots } : c)))
      }
    } else {
      setCells((prev) =>
        prev.map((c) =>
          c.id === cell.id
            ? {
                ...c,
                outputs: [
                  {
                    type: "text",
                    content: "Python/R execution not available in-browser demo. Use Editor or connect a backend.",
                  },
                ],
                plots: [],
              }
            : c,
        ),
      )
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button onClick={() => addCell("code")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Code Cell
        </Button>
        <Button variant="outline" onClick={() => addCell("markdown")}>
          <Plus className="mr-2 h-4 w-4" /> Add Markdown
        </Button>
      </div>

      <div className="space-y-4">
        {cells.map((cell) => (
          <Card key={cell.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                {cell.type === "markdown" ? "Markdown" : `Code (${cell.language})`}
              </CardTitle>
              <div className="flex items-center gap-2">
                {cell.type === "code" && (
                  <Button
                    size="sm"
                    onClick={() => runCell(cell)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Play className="mr-2 h-4 w-4" /> Run
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => removeCell(cell.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {cell.type === "markdown" ? (
                <Textarea
                  value={cell.content}
                  onChange={(e) =>
                    setCells((prev) => prev.map((c) => (c.id === cell.id ? { ...c, content: e.target.value } : c)))
                  }
                  placeholder="Write markdown..."
                  rows={6}
                />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Tabs
                      defaultValue={cell.language}
                      onValueChange={(v) =>
                        setCells((prev) =>
                          prev.map((c) => (c.id === cell.id && c.type === "code" ? { ...c, language: v as any } : c)),
                        )
                      }
                    >
                      <TabsList>
                        <TabsTrigger value="javascript">JS</TabsTrigger>
                        <TabsTrigger value="typescript">TS</TabsTrigger>
                        <TabsTrigger value="python">Py</TabsTrigger>
                        <TabsTrigger value="r">R</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <Badge variant="secondary">{"Inline outputs below"}</Badge>
                  </div>
                  <Editor
                    height="260px"
                    language={cell.language === "r" ? "r" : cell.language}
                    theme="vs-dark"
                    value={cell.content}
                    onChange={(v) =>
                      setCells((prev) =>
                        prev.map((c) => (c.id === cell.id && c.type === "code" ? { ...c, content: v ?? "" } : c)),
                      )
                    }
                    options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true }}
                  />
                  <Separator />
                  {cell.type === "code" && cell.outputs?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium">Output</div>
                      <div className="rounded-md border p-2 bg-muted/50 text-sm">
                        {cell.outputs.map((o, idx) => (
                          <div key={idx} className={o.type === "error" ? "text-red-500" : ""}>
                            {o.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {cell.type === "code" && cell.plots?.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium">Inline Plots</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cell.plots.map((series) => (
                          <ChartContainer
                            key={series.id}
                            config={{
                              y: { label: series.label, color: series.color || "hsl(160, 84%, 39%)" },
                            }}
                            className="h-48 w-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={series.data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="x" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="y" stroke={series.color || "#10b981"} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
