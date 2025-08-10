"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area } from "recharts"

type TrainingPoint = { step: number; accuracy: number; loss: number; valAccuracy: number; valLoss: number }

function generateNext(prev: TrainingPoint | null, step: number): TrainingPoint {
  if (!prev) {
    return { step, accuracy: 0.1, loss: 2.0, valAccuracy: 0.08, valLoss: 2.2 }
  }
  const acc = Math.min(0.99, prev.accuracy + Math.random() * 0.02)
  const vAcc = Math.min(0.99, prev.valAccuracy + Math.random() * 0.018)
  const loss = Math.max(0.05, prev.loss - Math.random() * 0.05)
  const vLoss = Math.max(0.05, prev.valLoss - Math.random() * 0.04)
  return {
    step,
    accuracy: +acc.toFixed(3),
    valAccuracy: +vAcc.toFixed(3),
    loss: +loss.toFixed(3),
    valLoss: +vLoss.toFixed(3),
  }
}

type TrainingDashboardProps = {
  autoRun?: boolean
}

export function TrainingDashboard({ autoRun = false }: TrainingDashboardProps) {
  const [data, setData] = React.useState<TrainingPoint[]>([])
  const [timer, setTimer] = React.useState<any>(null)

  React.useEffect(() => {
    if (autoRun) {
      const t = setInterval(() => {
        setData((prev) => {
          const next = generateNext(prev[prev.length - 1] || null, prev.length)
          return [...prev, next].slice(-200)
        })
      }, 600)
      setTimer(t)
      return () => clearInterval(t)
    } else if (timer) {
      clearInterval(timer)
      setTimer(null)
    }
  }, [autoRun])

  // Confusion matrix simulation
  const classes = ["A", "B", "C", "D"]
  const matrix: number[][] = React.useMemo(() => {
    const size = classes.length
    const base = Array.from({ length: size }, () => Array.from({ length: size }, () => 0))
    const total = 300
    for (let i = 0; i < total; i++) {
      const trueIdx = Math.floor(Math.random() * size)
      const correct = Math.random() > 0.2
      const predIdx = correct ? trueIdx : (trueIdx + 1 + Math.floor(Math.random() * (size - 1))) % size
      base[trueIdx][predIdx] += 1
    }
    return base
  }, [data.length]) // refresh occasionally

  const maxVal = Math.max(...matrix.flat())

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Training Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChartContainer
            config={{
              accuracy: { label: "Accuracy", color: "hsl(160, 84%, 39%)" },
              valAccuracy: { label: "Val Accuracy", color: "hsl(17, 88%, 61%)" },
            }}
            className="h-56 w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis domain={[0, 1]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" dot={false} />
                <Line type="monotone" dataKey="valAccuracy" stroke="#f97316" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer
            config={{
              loss: { label: "Loss", color: "hsl(220, 13%, 69%)" },
              valLoss: { label: "Val Loss", color: "hsl(340, 82%, 52%)" },
            }}
            className="h-56 w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area type="monotone" dataKey="loss" stroke="#64748b" fill="#94a3b8" fillOpacity={0.3} />
                <Area type="monotone" dataKey="valLoss" stroke="#ec4899" fill="#f0abfc" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Confusion Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <div />
            <div className="grid grid-cols-4 gap-1">
              {classes.map((c) => (
                <div key={c} className="text-center text-xs text-muted-foreground">
                  {c}
                </div>
              ))}
            </div>
            <div className="grid gap-1">
              {classes.map((c) => (
                <div key={c} className="text-xs text-muted-foreground h-8 flex items-center">
                  {c}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {matrix.flatMap((row, i) =>
                row.map((val, j) => {
                  const intensity = maxVal ? val / maxVal : 0
                  const bg = `rgba(16,185,129,${0.15 + intensity * 0.85})`
                  return (
                    <div
                      key={`${i}-${j}`}
                      className="h-8 rounded flex items-center justify-center text-xs"
                      style={{ backgroundColor: bg, color: intensity > 0.6 ? "white" : "black" }}
                      title={`True ${classes[i]} / Pred ${classes[j]}: ${val}`}
                    >
                      {val}
                    </div>
                  )
                }),
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
