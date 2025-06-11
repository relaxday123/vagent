import type { ReactNode } from "react"

export default function CreditScoreLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-muted/20">{children}</div>
}
