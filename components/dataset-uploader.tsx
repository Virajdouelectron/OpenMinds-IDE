"use client"

import * as React from "react"
import Papa from "papaparse"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, TableIcon } from "lucide-react"

type ParsedCSV = {
  fields: string[]
  rows: any[][]
}

export function DatasetUploader() {
  const [dragActive, setDragActive] = React.useState(false)
  const [parsed, setParsed] = React.useState<ParsedCSV | null>(null)
  const [fileName, setFileName] = React.useState<string | null>(null)

  const parseFile = (file: File) => {
    setFileName(file.name)
    Papa.parse(file, {
      complete: (res) => {
        const data = res.data as any[][]
        const fields = (data[0] || []).map((h) => String(h))
        const rows = data.slice(1).filter((r) => r.length > 0)
        setParsed({ fields, rows })
      },
      skipEmptyLines: true,
    })
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) parseFile(file)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Upload Dataset</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-md p-6 text-center ${dragActive ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-muted"}`}
          >
            <Upload className="mx-auto h-8 w-8 mb-2 opacity-70" />
            <div className="font-medium">Drag & drop CSV here</div>
            <div className="text-xs text-muted-foreground mb-3">or select a file</div>
            <Input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])} />
            {fileName && <div className="text-xs mt-2">{fileName}</div>}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <TableIcon className="h-4 w-4" /> Preview
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {parsed ? `${parsed.rows.length} rows • ${parsed.fields.length} columns` : "No dataset loaded"}
          </div>
        </CardHeader>
        <CardContent>
          {parsed ? (
            <ScrollArea className="h-[50vh] w-full rounded-md border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr>
                    {parsed.fields.map((f, i) => (
                      <th key={i} className="text-left p-2 border-b">
                        {f}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 300).map((row, rIdx) => (
                    <tr key={rIdx} className="odd:bg-muted/30">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2 border-b">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          ) : (
            <div className="text-sm text-muted-foreground">Upload a CSV to preview data.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
