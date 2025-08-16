"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Brain, Upload, Search, FileText } from "lucide-react"

export function MemoryModule() {
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "company-policies.pdf", size: "2.3 MB", status: "processed" },
    { name: "product-catalog.txt", size: "1.1 MB", status: "processing" },
  ])

  return (
    <Card className="bg-stone-200 border-gray-500">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Memory Module
        </CardTitle>
        <CardDescription className="text-gray-600">Vector embeddings and RAG knowledge base management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Knowledge Base Upload</h3>
          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center bg-white">
            <Upload className="h-8 w-8 mx-auto text-gray-500 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Upload documents for vector embedding</p>
            <p className="text-xs text-gray-500">Supports PDF, TXT, DOCX files</p>
            <Button className="mt-3 bg-gray-900 hover:bg-gray-800 text-white" size="sm">
              Select Files
            </Button>
          </div>
        </div>

        {/* Uploaded Files */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Uploaded Documents</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-600">{file.size}</p>
                  </div>
                </div>
                <Badge variant={file.status === "processed" ? "default" : "secondary"}>
                  {file.status === "processed" ? "Ready" : "Processing"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Vector Search */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Vector Search (RAG)</h3>
          <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white border-gray-300"
              />
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {searchQuery && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">Search results:</p>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-900 mb-1">Company Policy - Customer Service</p>
                  <p className="text-xs text-gray-600">
                    "Our customer service team should respond to all inquiries within 24 hours..."
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Similarity: 0.89
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Memory Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Memory Statistics</h3>
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">2.4k</div>
                <div className="text-xs text-gray-600">Vector Embeddings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">15</div>
                <div className="text-xs text-gray-600">Documents Processed</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
