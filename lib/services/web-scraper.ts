import { chromium, type Browser, type Page, type BrowserContext } from "playwright"
import { createServerClient } from "@/lib/supabase/server"

export interface ScrapingConfig {
  url: string
  selectors: Record<string, string>
  waitForSelector?: string
  scrollToBottom?: boolean
  pagination?: {
    nextButtonSelector: string
    maxPages: number
  }
  antiBot?: {
    userAgent?: string
    viewport?: { width: number; height: number }
    delay?: { min: number; max: number }
    proxy?: string
  }
  outputFormat: "json" | "csv"
  respectRobots?: boolean
  rateLimit?: number // milliseconds between requests
}

export interface ScrapingResult {
  success: boolean
  data: any[]
  metadata: {
    url: string
    timestamp: string
    totalItems: number
    pagesScraped: number
    errors: string[]
  }
}

export class WebScraperService {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private supabase = createServerClient()

  async initialize() {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      })

      this.context = await this.browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        viewport: { width: 1920, height: 1080 },
      })

      console.log("Web scraper initialized successfully")
    } catch (error) {
      console.error("Failed to initialize web scraper:", error)
      throw error
    }
  }

  async scrapeWebsite(config: ScrapingConfig): Promise<ScrapingResult> {
    const startTime = Date.now()
    const result: ScrapingResult = {
      success: false,
      data: [],
      metadata: {
        url: config.url,
        timestamp: new Date().toISOString(),
        totalItems: 0,
        pagesScraped: 0,
        errors: [],
      },
    }

    try {
      if (!this.context) {
        await this.initialize()
      }

      // Check robots.txt if required
      if (config.respectRobots) {
        const robotsAllowed = await this.checkRobotsTxt(config.url)
        if (!robotsAllowed) {
          throw new Error("Scraping not allowed by robots.txt")
        }
      }

      const page = await this.context!.newPage()

      // Configure anti-bot measures
      if (config.antiBot) {
        await this.configureAntiBot(page, config.antiBot)
      }

      // Navigate to the target URL
      await page.goto(config.url, { waitUntil: "networkidle" })

      // Wait for specific selector if provided
      if (config.waitForSelector) {
        await page.waitForSelector(config.waitForSelector, { timeout: 30000 })
      }

      // Handle pagination if configured
      if (config.pagination) {
        await this.scrapePaginatedContent(page, config, result)
      } else {
        await this.scrapeSinglePage(page, config, result)
      }

      // Store scraping results
      await this.storeScrapeResults(config, result)

      result.success = true
      result.metadata.totalItems = result.data.length

      await page.close()
    } catch (error) {
      console.error("Scraping error:", error)
      result.metadata.errors.push(error instanceof Error ? error.message : "Unknown error")
    }

    // Log scraping activity
    await this.logScrapingActivity(config, result, Date.now() - startTime)

    return result
  }

  private async scrapeSinglePage(page: Page, config: ScrapingConfig, result: ScrapingResult) {
    try {
      // Scroll to bottom if required (for lazy-loaded content)
      if (config.scrollToBottom) {
        await this.scrollToBottom(page)
      }

      // Extract data using provided selectors
      const pageData = await page.evaluate((selectors) => {
        const items: any[] = []

        // Find all container elements (assuming first selector is the container)
        const containerSelector = Object.values(selectors)[0]
        const containers = document.querySelectorAll(containerSelector)

        containers.forEach((container) => {
          const item: any = {}

          Object.entries(selectors).forEach(([key, selector]) => {
            if (key !== Object.keys(selectors)[0]) {
              // Skip container selector
              const element = container.querySelector(selector)
              if (element) {
                item[key] = element.textContent?.trim() || element.getAttribute("href") || element.getAttribute("src")
              }
            }
          })

          if (Object.keys(item).length > 0) {
            items.push(item)
          }
        })

        return items
      }, config.selectors)

      result.data.push(...pageData)
      result.metadata.pagesScraped = 1

      // Apply rate limiting
      if (config.rateLimit) {
        await this.delay(config.rateLimit)
      }
    } catch (error) {
      console.error("Error scraping single page:", error)
      result.metadata.errors.push(`Single page error: ${error}`)
    }
  }

  private async scrapePaginatedContent(page: Page, config: ScrapingConfig, result: ScrapingResult) {
    let currentPage = 1
    const maxPages = config.pagination!.maxPages

    while (currentPage <= maxPages) {
      try {
        console.log(`Scraping page ${currentPage}`)

        // Scrape current page
        await this.scrapeSinglePage(page, config, result)

        // Check if next page button exists and is clickable
        const nextButton = await page.$(config.pagination!.nextButtonSelector)
        if (!nextButton) {
          console.log("No more pages found")
          break
        }

        const isDisabled = await nextButton.isDisabled()
        if (isDisabled) {
          console.log("Next button is disabled")
          break
        }

        // Click next page button
        await nextButton.click()

        // Wait for page to load
        await page.waitForLoadState("networkidle")

        // Additional wait if specified
        if (config.waitForSelector) {
          await page.waitForSelector(config.waitForSelector)
        }

        currentPage++
        result.metadata.pagesScraped = currentPage

        // Apply rate limiting between pages
        if (config.rateLimit) {
          await this.delay(config.rateLimit)
        }
      } catch (error) {
        console.error(`Error on page ${currentPage}:`, error)
        result.metadata.errors.push(`Page ${currentPage} error: ${error}`)
        break
      }
    }
  }

  private async configureAntiBot(page: Page, antiBot: ScrapingConfig["antiBot"]) {
    if (!antiBot) return

    // Set custom user agent
    if (antiBot.userAgent) {
      await page.setUserAgent(antiBot.userAgent)
    }

    // Set viewport
    if (antiBot.viewport) {
      await page.setViewportSize(antiBot.viewport)
    }

    // Add random delays
    if (antiBot.delay) {
      const delay = Math.random() * (antiBot.delay.max - antiBot.delay.min) + antiBot.delay.min
      await this.delay(delay)
    }

    // Stealth mode configurations
    await page.addInitScript(() => {
      // Override webdriver property
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      })

      // Override plugins length
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      })

      // Override languages
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      })
    })
  }

  private async scrollToBottom(page: Page) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0
        const distance = 100
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight
          window.scrollBy(0, distance)
          totalHeight += distance

          if (totalHeight >= scrollHeight) {
            clearInterval(timer)
            resolve()
          }
        }, 100)
      })
    })
  }

  private async checkRobotsTxt(url: string): Promise<boolean> {
    try {
      const robotsUrl = new URL("/robots.txt", url).toString()
      const response = await fetch(robotsUrl)

      if (!response.ok) {
        return true // If robots.txt doesn't exist, assume allowed
      }

      const robotsText = await response.text()

      // Simple robots.txt parsing (in production, use a proper parser)
      const lines = robotsText.split("\n")
      let userAgentSection = false

      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase()

        if (trimmedLine.startsWith("user-agent:")) {
          const userAgent = trimmedLine.split(":")[1].trim()
          userAgentSection = userAgent === "*" || userAgent.includes("bot")
        }

        if (userAgentSection && trimmedLine.startsWith("disallow:")) {
          const disallowPath = trimmedLine.split(":")[1].trim()
          if (disallowPath === "/" || url.includes(disallowPath)) {
            return false
          }
        }
      }

      return true
    } catch (error) {
      console.error("Error checking robots.txt:", error)
      return true // Default to allowed if check fails
    }
  }

  private async storeScrapeResults(config: ScrapingConfig, result: ScrapingResult) {
    try {
      await this.supabase.from("scraping_results").insert({
        url: config.url,
        data: result.data,
        metadata: result.metadata,
        config: config,
        scraped_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error storing scrape results:", error)
    }
  }

  private async logScrapingActivity(config: ScrapingConfig, result: ScrapingResult, duration: number) {
    try {
      await this.supabase.from("scraping_logs").insert({
        url: config.url,
        success: result.success,
        items_scraped: result.data.length,
        pages_scraped: result.metadata.pagesScraped,
        duration_ms: duration,
        errors: result.metadata.errors,
        logged_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error logging scraping activity:", error)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async close() {
    if (this.context) {
      await this.context.close()
    }
    if (this.browser) {
      await this.browser.close()
    }
  }
}

// Predefined scraping configurations for common websites
export const SCRAPING_TEMPLATES = {
  ecommerce: {
    selectors: {
      container: ".product-item",
      title: ".product-title",
      price: ".price",
      image: "img",
      rating: ".rating",
      availability: ".stock-status",
    },
    waitForSelector: ".product-item",
    scrollToBottom: true,
    outputFormat: "json" as const,
  },
  news: {
    selectors: {
      container: "article",
      headline: "h1, h2, .headline",
      summary: ".summary, .excerpt",
      author: ".author",
      date: ".date, time",
      link: "a",
    },
    waitForSelector: "article",
    outputFormat: "json" as const,
  },
  social: {
    selectors: {
      container: ".post",
      content: ".post-content",
      author: ".author-name",
      timestamp: ".timestamp",
      likes: ".like-count",
      shares: ".share-count",
    },
    waitForSelector: ".post",
    scrollToBottom: true,
    outputFormat: "json" as const,
  },
  crypto: {
    selectors: {
      container: ".coin-row",
      name: ".coin-name",
      symbol: ".coin-symbol",
      price: ".price",
      change24h: ".change-24h",
      volume: ".volume",
      marketCap: ".market-cap",
    },
    waitForSelector: ".coin-row",
    outputFormat: "json" as const,
  },
}
