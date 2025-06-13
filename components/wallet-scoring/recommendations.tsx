import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, TrendingUp, Wallet, Clock, Activity, Coins } from "lucide-react"

interface RecommendationsProps {
  score: number
  recommendations: string[]
}

export function Recommendations({ score, recommendations }: RecommendationsProps) {
  const getScoreMessage = (score: number) => {
    if (score >= 80) {
      return {
        title: "Excellent Score",
        description: "Your wallet demonstrates excellent blockchain activity and financial health.",
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      }
    } else if (score >= 60) {
      return {
        title: "Good Score",
        description: "Your wallet shows good blockchain activity and reasonable financial health.",
        icon: <CheckCircle className="h-5 w-5 text-blue-600" />,
      }
    } else if (score >= 40) {
      return {
        title: "Fair Score",
        description: "Your wallet has fair blockchain activity but could improve in some areas.",
        icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      }
    } else {
      return {
        title: "Poor Score",
        description: "Your wallet shows limited blockchain activity or financial health concerns.",
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      }
    }
  }

  const message = getScoreMessage(score)

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes("wallet age")) return <Clock className="h-4 w-4" />
    if (recommendation.includes("transaction count")) return <Activity className="h-4 w-4" />
    if (recommendation.includes("transaction frequency")) return <Activity className="h-4 w-4" />
    if (recommendation.includes("token")) return <Coins className="h-4 w-4" />
    if (recommendation.includes("ETH balance")) return <Wallet className="h-4 w-4" />
    return <TrendingUp className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {message.icon}
          <CardTitle>{message.title}</CardTitle>
        </div>
        <CardDescription>{message.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium">Recommendations to Improve Your Score</h4>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  {getRecommendationIcon(recommendation)}
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p>Great job! Your wallet is in excellent condition.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
