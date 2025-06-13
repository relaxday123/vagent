import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { name, config, schedule, enabled = true } = await request.json()

    const supabase = createServerClient()

    // Store scheduled scraping job
    const { data, error } = await supabase
      .from("scheduled_scraping")
      .insert({
        name,
        config,
        schedule, // cron expression
        enabled,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Schedule API error:", error)
    return NextResponse.json({ error: "Failed to schedule scraping job" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("scheduled_scraping")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Get schedules API error:", error)
    return NextResponse.json({ error: "Failed to fetch scheduled jobs" }, { status: 500 })
  }
}
