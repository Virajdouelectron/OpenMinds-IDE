"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Rocket, Settings2, Copy } from "lucide-react"

type DeployConfig = {
  runtime: "python3.11" | "python3.10"
  cpu: number
  memory: number
  gpu: "none" | "t4" | "l4"
  packages: string
}

function toYaml(cfg: DeployConfig) {
  return [
    "name: openminds-model",
    "runtime: " + cfg.runtime,
    "resources:",
    "  cpu: " + cfg.cpu,
    "  memory: " + cfg.memory + "Gi",
    "  gpu: " + cfg.gpu,
    "python:",
    "  packages:",
    ...cfg.packages
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((p) => "    - " + p),
  ].join("\n")
}

export function TestAndDeploy() {
  const [sample, setSample] = React.useState('{"text": "The quick brown fox"}')
  const [output, setOutput] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [cfg, setCfg] = React.useState<DeployConfig>({
    runtime: "python3.11",
    cpu: 2,
    memory: 4,
    gpu: "none",
    packages: "numpy==2.0.1\npandas==2.2.2\nscikit-learn==1.5.1",
  })
  const { toast } = useToast()

  const runInference = () => {
    try {
      const parsed = JSON.parse(sample)
      // Mock model: classify length
      const txt = String(parsed.text ?? "")
      const label = txt.length % 2 === 0 ? "even" : "odd"
      setOutput(JSON.stringify({ label, length: txt.length }, null, 2))
    } catch (e: any) {
      setOutput("Invalid JSON input.")
    }
  }

  const copyYaml = async () => {
    await navigator.clipboard.writeText(toYaml(cfg))
    toast({ title: "Copied deployment config to clipboard" })
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Model</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="sample" className="text-xs">
            Sample JSON Input
          </Label>
          <Textarea id="sample" value={sample} onChange={(e) => setSample(e.target.value)} rows={8} />
          <div className="flex items-center gap-2">
            <Button onClick={runInference} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Run Inference
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Deploy Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Deployment Configuration</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Runtime</Label>
                    <select
                      className="mt-1 w-full h-9 rounded-md border bg-background px-2"
                      value={cfg.runtime}
                      onChange={(e) => setCfg({ ...cfg, runtime: e.target.value as any })}
                    >
                      <option value="python3.11">{"Python 3.11"}</option>
                      <option value="python3.10">{"Python 3.10"}</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">CPU</Label>
                    <Input
                      type="number"
                      value={cfg.cpu}
                      onChange={(e) => setCfg({ ...cfg, cpu: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Memory (Gi)</Label>
                    <Input
                      type="number"
                      value={cfg.memory}
                      onChange={(e) => setCfg({ ...cfg, memory: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">GPU</Label>
                    <select
                      className="mt-1 w-full h-9 rounded-md border bg-background px-2"
                      value={cfg.gpu}
                      onChange={(e) => setCfg({ ...cfg, gpu: e.target.value as any })}
                    >
                      <option value="none">None</option>
                      <option value="t4">NVIDIA T4</option>
                      <option value="l4">NVIDIA L4</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Python Packages</Label>
                    <Textarea
                      rows={6}
                      value={cfg.packages}
                      onChange={(e) => setCfg({ ...cfg, packages: e.target.value })}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Label className="text-xs">YAML Preview</Label>
                  <pre className="mt-1 p-3 rounded-md border bg-muted/50 text-xs whitespace-pre-wrap">
                    {toYaml(cfg)}
                  </pre>
                  <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={copyYaml}>
                      <Copy className="h-4 w-4 mr-2" /> Copy YAML
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div>
            <Label className="text-xs">Output</Label>
            <pre className="mt-1 p-3 rounded-md border bg-muted/50 text-sm whitespace-pre-wrap">{output || "—"}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Deploy Model</CardTitle>
          <Rocket className="h-5 w-5 text-emerald-600" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {"This demo prepares a deployment configuration. Connect your backend to trigger builds and deploys."}
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">Prepare Deployment</Button>
          <div className="text-xs text-muted-foreground">
            {
              "Next step: wire this action to your CI/CD or a serverless route that builds container images and provisions infra."
            }
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
