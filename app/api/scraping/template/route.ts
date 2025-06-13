import { NextResponse } from "next/server"
import { SCRAPING_TEMPLATES } from "@/lib/services/web-scraper"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      templates: SCRAPING_TEMPLATES,
    })
  } catch (error) {
    console.error("Templates API error:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}
