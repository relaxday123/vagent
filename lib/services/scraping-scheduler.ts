import { createServerClient } from "@/lib/supabase/server"
import { WebScraperService } from "./web-scraper"

export class ScrapingScheduler {
  private supabase = createServerClient()
  private isRunning = false

  async start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log("Scraping scheduler started")

    // Run every minute to check for scheduled jobs
    setInterval(async () => {
      await this.processScheduledJobs()
    }, 60000)
  }

  async stop() {
    this.isRunning = false
    console.log("Scraping scheduler stopped")
  }

  private async processScheduledJobs() {
    try {
      // Get jobs that are due to run
      const { data: jobs, error } = await this.supabase
        .from("scheduled_scraping")
        .select("*")
        .eq("enabled", true)
        .lte("next_run", new Date().toISOString())

      if (error) {
        console.error("Error fetching scheduled jobs:", error)
        return
      }

      for (const job of jobs || []) {
        await this.executeJob(job)
      }
    } catch (error) {
      console.error("Error processing scheduled jobs:", error)
    }
  }

  private async executeJob(job: any) {
    try {
      console.log(`Executing scheduled job: ${job.name}`)

      // Update last_run timestamp
      await this.supabase
        .from("scheduled_scraping")
        .update({
          last_run: new Date().toISOString(),
          next_run: this.calculateNextRun(job.schedule),
        })
        .eq("id", job.id)

      // Execute the scraping job
      const scraper = new WebScraperService()

      try {
        const result = await scraper.scrapeWebsite(job.config)

        // Log successful execution
        await this.supabase.from("scraping_logs").insert({
          url: job.config.url,
          success: result.success,
          items_scraped: result.data.length,
          pages_scraped: result.metadata.pagesScraped,
          errors: result.metadata.errors,
          logged_at: new Date().toISOString(),
        })

        console.log(`Job ${job.name} completed successfully`)
      } finally {
        await scraper.close()
      }
    } catch (error) {
      console.error(`Error executing job ${job.name}:`, error)

      // Log failed execution
      await this.supabase.from("scraping_logs").insert({
        url: job.config.url,
        success: false,
        items_scraped: 0,
        pages_scraped: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        logged_at: new Date().toISOString(),
      })
    }
  }

  private calculateNextRun(cronExpression: string): string {
    // Simple implementation - in production, use a proper cron parser
    // For now, just add 1 hour
    const nextRun = new Date()
    nextRun.setHours(nextRun.getHours() + 1)
    return nextRun.toISOString()
  }
}

// Export singleton instance
export const scrapingScheduler = new ScrapingScheduler()
