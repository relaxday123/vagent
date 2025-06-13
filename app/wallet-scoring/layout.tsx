import type { ReactNode } from "react"

export default function WalletScoringLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <h1 className="text-xl font-bold">Blockchain Wallet Credit Scoring</h1>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
