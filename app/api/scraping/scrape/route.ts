import { type NextRequest, NextResponse } from "next/server"
import { WebScraperService, type ScrapingConfig } from "@/lib/services/web-scraper"

export async function POST(request: NextRequest) {
  try {
    const config: ScrapingConfig = await request.json()

    // Validate required fields
    if (!config.url || !config.selectors) {
      return NextResponse.json({ error: "URL and selectors are required" }, { status: 400 })
    }

    // Initialize scraper
    const scraper = new WebScraperService()

    try {
      // Perform scraping
      const result = await scraper.scrapeWebsite(config)

      return NextResponse.json({
        success: true,
        data: result,
      })
    } finally {
      // Always close the scraper
      await scraper.close()
    }
  } catch (error) {
    console.error("Scraping API error:", error)
    return NextResponse.json(
      { error: "Failed to scrape website", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
