"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Play, Download, Settings, Globe } from "lucide-react"

interface ScrapingTemplate {
  selectors: Record<string, string>
  waitForSelector?: string
  scrollToBottom?: boolean
  outputFormat: "json" | "csv"
}

export default function WebScraperPage() {
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<Record<string, ScrapingTemplate>>({})
  const [results, setResults] = useState<any>(null)

  // Form state
  const [url, setUrl] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [customSelectors, setCustomSelectors] = useState("")
  const [waitForSelector, setWaitForSelector] = useState("")
  const [scrollToBottom, setScrollToBottom] = useState(false)
  const [respectRobots, setRespectRobots] = useState(true)
  const [rateLimit, setRateLimit] = useState(1000)
  const [maxPages, setMaxPages] = useState(1)
  const [nextButtonSelector, setNextButtonSelector] = useState("")
  const [outputFormat, setOutputFormat] = useState<"json" | "csv">("json")

  // Anti-bot settings
  const [useAntiBot, setUseAntiBot] = useState(true)
  const [customUserAgent, setCustomUserAgent] = useState("")
  const [minDelay, setMinDelay] = useState(1000)
  const [maxDelay, setMaxDelay] = useState(3000)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/scraping/templates")
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    }
  }

  const handleScrape = async () => {
    if (!url) return

    setLoading(true)
    setResults(null)

    try {
      let selectors: Record<string, string> = {}

      if (selectedTemplate && templates[selectedTemplate]) {
        selectors = templates[selectedTemplate].selectors
      } else if (customSelectors) {
        try {
          selectors = JSON.parse(customSelectors)
        } catch (error) {
          throw new Error("Invalid JSON in custom selectors")
        }
      } else {
        throw new Error("Please select a template or provide custom selectors")
      }

      const config = {
        url,
        selectors,
        waitForSelector: waitForSelector || undefined,
        scrollToBottom,
        pagination:
          maxPages > 1
            ? {
                nextButtonSelector,
                maxPages,
              }
            : undefined,
        antiBot: useAntiBot
          ? {
              userAgent: customUserAgent || undefined,
              viewport: { width: 1920, height: 1080 },
              delay: { min: minDelay, max: maxDelay },
            }
          : undefined,
        outputFormat,
        respectRobots,
        rateLimit,
      }

      const response = await fetch("/api/scraping/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.data)
      } else {
        throw new Error(data.error || "Scraping failed")
      }
    } catch (error) {
      console.error("Scraping error:", error)
      setResults({
        success: false,
        metadata: {
          errors: [error instanceof Error ? error.message : "Unknown error"],
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template)
    if (template && templates[template]) {
      const templateConfig = templates[template]
      setCustomSelectors(JSON.stringify(templateConfig.selectors, null, 2))
      setWaitForSelector(templateConfig.waitForSelector || "")
      setScrollToBottom(templateConfig.scrollToBottom || false)
      setOutputFormat(templateConfig.outputFormat)
    }
  }

  const downloadResults = () => {
    if (!results?.data) return

    const dataStr = outputFormat === "json" ? JSON.stringify(results.data, null, 2) : convertToCSV(results.data)

    const dataBlob = new Blob([dataStr], {
      type: outputFormat === "json" ? "application/json" : "text/csv",
    })

    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `scraped-data.${outputFormat}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: any[]) => {
    if (!data.length) return ""

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || "")).join(",")),
    ].join("\n")

    return csvContent
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Advanced Web Scraper</h1>
        <p className="text-muted-foreground">
          Extract data from websites with dynamic content handling and anti-bot protection
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Scraping Configuration
            </CardTitle>
            <CardDescription>Configure your web scraping parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Target URL</Label>
              <Input id="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>

            <Tabs defaultValue="template" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">Use Template</TabsTrigger>
                <TabsTrigger value="custom">Custom Selectors</TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="space-y-4">
                <div className="space-y-2">
                  <Label>Scraping Template</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(templates).map((template) => (
                        <SelectItem key={template} value={template}>
                          {template.charAt(0).toUpperCase() + template.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="selectors">Custom Selectors (JSON)</Label>
                  <Textarea
                    id="selectors"
                    placeholder='{"container": ".item", "title": "h2", "price": ".price"}'
                    value={customSelectors}
                    onChange={(e) => setCustomSelectors(e.target.value)}
                    rows={6}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="waitSelector">Wait for Selector</Label>
                <Input
                  id="waitSelector"
                  placeholder=".content"
                  value={waitForSelector}
                  onChange={(e) => setWaitForSelector(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rateLimit">Rate Limit (ms)</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="scrollBottom">Scroll to Bottom</Label>
                <Switch id="scrollBottom" checked={scrollToBottom} onCheckedChange={setScrollToBottom} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="respectRobots">Respect robots.txt</Label>
                <Switch id="respectRobots" checked={respectRobots} onCheckedChange={setRespectRobots} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="antiBot">Anti-Bot Protection</Label>
                <Switch id="antiBot" checked={useAntiBot} onCheckedChange={setUseAntiBot} />
              </div>
            </div>

            {useAntiBot && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">Anti-Bot Settings</h4>

                <div className="space-y-2">
                  <Label htmlFor="userAgent">Custom User Agent</Label>
                  <Input
                    id="userAgent"
                    placeholder="Leave empty for default"
                    value={customUserAgent}
                    onChange={(e) => setCustomUserAgent(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minDelay">Min Delay (ms)</Label>
                    <Input
                      id="minDelay"
                      type="number"
                      value={minDelay}
                      onChange={(e) => setMinDelay(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxDelay">Max Delay (ms)</Label>
                    <Input
                      id="maxDelay"
                      type="number"
                      value={maxDelay}
                      onChange={(e) => setMaxDelay(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Pagination Settings</h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxPages">Max Pages</Label>
                  <Input
                    id="maxPages"
                    type="number"
                    min="1"
                    value={maxPages}
                    onChange={(e) => setMaxPages(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextButton">Next Button Selector</Label>
                  <Input
                    id="nextButton"
                    placeholder=".next-page"
                    value={nextButtonSelector}
                    onChange={(e) => setNextButtonSelector(e.target.value)}
                    disabled={maxPages <= 1}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={outputFormat} onValueChange={(value: "json" | "csv") => setOutputFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleScrape} disabled={loading || !url} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Scraping
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Scraping Results
            </CardTitle>
            <CardDescription>View and download extracted data</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Scraping in progress...</span>
                </div>
                <Progress value={33} />
              </div>
            )}

            {results && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={results.success ? "default" : "destructive"}>
                      {results.success ? "Success" : "Failed"}
                    </Badge>
                    {results.success && (
                      <span className="text-sm text-muted-foreground">{results.data?.length || 0} items extracted</span>
                    )}
                  </div>

                  {results.success && results.data?.length > 0 && (
                    <Button size="sm" onClick={downloadResults}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>

                {results.metadata && (
                  <div className="space-y-2">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Pages Scraped:</span>
                        <span>{results.metadata.pagesScraped || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Items:</span>
                        <span>{results.metadata.totalItems || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timestamp:</span>
                        <span>{new Date(results.metadata.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    {results.metadata.errors?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-600">Errors:</h4>
                        <ul className="text-sm space-y-1">
                          {results.metadata.errors.map((error: string, index: number) => (
                            <li key={index} className="text-red-600">
                              • {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {results.success && results.data?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Sample Data:</h4>
                    <div className="max-h-64 overflow-auto">
                      <pre className="text-xs bg-muted p-3 rounded">
                        {JSON.stringify(results.data.slice(0, 3), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && !results && (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your scraping parameters and click "Start Scraping" to begin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>Pre-configured scraping templates for common website types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(templates).map(([name, template]) => (
              <div key={name} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{name.charAt(0).toUpperCase() + name.slice(1)}</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Selectors: {Object.keys(template.selectors).length}</p>
                  <p>Format: {template.outputFormat.toUpperCase()}</p>
                  {template.scrollToBottom && (
                    <Badge variant="outline" className="text-xs">
                      Auto-scroll
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
