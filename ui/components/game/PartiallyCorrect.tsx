"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Star, ArrowRight, Zap } from "lucide-react"
import { useEffect, useState } from "react"

export default function PartiallyCorrectModal() {
  const [animatedScore, setAnimatedScore] = useState(0)
  const targetScore = 2

  useEffect(() => {
    const duration = 800
    const steps = 30
    const increment = targetScore / steps
    const stepDuration = duration / steps

    let currentStep = -1
    const timer = setInterval(() => {
      currentStep++
      const newScore = Math.min(Math.round(increment * currentStep), targetScore)
      setAnimatedScore(newScore)

      if (newScore >= targetScore) {
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [targetScore])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl border-0 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold animate-slide-in-left">Partially Correct!</h2>
                <p className="text-orange-100 text-sm animate-fade-in">Good effort</p>
              </div>
            </div>
            <div className="text-right animate-slide-in-right">
              <div className="text-2xl font-bold">+1</div>
              <div className="text-orange-100 text-xs">Points</div>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Enhanced Score Section */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-bounce-slow">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 animate-slide-in-left">Current Score</div>
                  <div className="text-xs text-orange-700 animate-fade-in">Keep trying!</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right animate-slide-in-right">
                  <div className="text-lg font-bold text-orange-800 tabular-nums">{animatedScore}</div>
                  <div className="text-xs text-orange-600">Total</div>
                </div>
                <Badge className="bg-orange-200 text-orange-900 border-orange-300 animate-pulse-scale px-3 py-1">
                  <Star className="w-3 h-3 mr-1 animate-spin-slow" />
                  Level 1
                </Badge>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400 animate-fade-in-up">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Explanation
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                You identified some key points, but missed that checking multiple reliable sources is important. While
                asking her sister was good, she should also verify with medical professionals or trusted health
                websites.
              </p>
            </div>

            {/* Action Area */}
            <div className="flex justify-end pt-2">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 animate-slide-in-right group">
                Continue
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out 0.2s both;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out 0.3s both;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.5s both;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
