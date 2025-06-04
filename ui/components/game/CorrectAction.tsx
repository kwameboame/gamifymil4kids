"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, ArrowRight, Zap } from "lucide-react"
import { useEffect, useState } from "react"

export default function Component() {
  const [animatedScore, setAnimatedScore] = useState(0)
  const targetScore = 3

  useEffect(() => {
    const duration = 800 // 0.8 seconds (changed from 1500)
    const steps = 30
    const increment = targetScore / steps
    const stepDuration = duration / steps

    let currentStep = -1 // Start at -1 so first increment gives us 0
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold animate-slide-in-left">Correct!</h2>
                <p className="text-green-100 text-sm animate-fade-in">Well done</p>
              </div>
            </div>
            <div className="text-right animate-slide-in-right">
              <div className="text-2xl font-bold">+3</div>
              <div className="text-green-100 text-xs">Points</div>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Enhanced Score Section */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-bounce-slow">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 animate-slide-in-left">Current Score</div>
                  <div className="text-xs text-amber-700 animate-fade-in">You&apos;re doing great</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right animate-slide-in-right">
                  <div className="text-lg font-bold text-amber-800 tabular-nums">{animatedScore}</div>
                  <div className="text-xs text-amber-600">Total</div>
                </div>
                <Badge className="bg-amber-200 text-amber-900 border-amber-300 animate-pulse-scale px-3 py-1">
                  <Star className="w-3 h-3 mr-1 animate-spin-slow" />
                  Level 1
                </Badge>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400 animate-fade-in-up">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Explanation
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                She asks her sister and checks online: She discovers that while ginger tea is healthy, it can&apos;t prevent
                all illnesses. Adjoa tells her friends the truth, and they all agree not to share the message without
                checking first.
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
