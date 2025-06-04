"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, X, Star, ArrowRight, Zap, BookOpen } from "lucide-react"
import { useEffect, useState } from "react"

export interface ActionOutcomeProps {
  type: 'correct' | 'partially' | 'wrong';
  points: number;
  currentScore: number;
  level: number;
  explanation?: string;
  onContinue: () => void;
}

export default function ActionOutcome({ 
  type, 
  points, 
  currentScore,
  level,
  explanation,
  onContinue 
}: ActionOutcomeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  useEffect(() => {
    if (type === 'wrong') {
      // For wrong answers, just set score directly - no animation needed
      setAnimatedScore(currentScore);
      return;
    }
    
    const duration = 800; // 0.8 seconds
    const steps = 30;
    const increment = points / steps;
    const stepDuration = duration / steps;

    let currentStep = -1;
    const timer = setInterval(() => {
      currentStep++;
      const newScore = Math.min(Math.round(increment * currentStep), points);
      setAnimatedScore(currentScore - points + newScore);

      if (newScore >= points) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [points, currentScore, type]);
  
  // Determine styles and content based on type
  const getOutcomeConfig = () => {
    switch (type) {
      case 'correct':
        return {
          gradientClass: 'from-green-500 to-emerald-600',
          scoreGradientClass: 'from-amber-50 via-yellow-50 to-amber-50',
          badgeClass: 'bg-amber-200 text-amber-900 border-amber-300',
          accentColor: 'green',
          icon: <CheckCircle className="w-6 h-6" />,
          title: 'Correct!',
          subtitle: 'Well done',
          scoreSubtitle: 'You\'re doing great',
          accentTextClass: 'text-green-100',
          accentBgClass: 'bg-white/20',
          iconAccent: <Zap className="w-4 h-4 text-white" />,
          iconBgClass: 'bg-amber-500',
          scoreTextClass: 'text-amber-800',
          scoreSmallTextClass: 'text-amber-600',
          pointsDisplay: `+${points}`,
          explanationBg: 'bg-blue-50',
          explanationBorder: 'border-blue-400',
          explanationTitle: 'Explanation'
        };
      case 'partially':
        return {
          gradientClass: 'from-orange-500 to-amber-600',
          scoreGradientClass: 'from-orange-50 via-amber-50 to-orange-50',
          badgeClass: 'bg-orange-200 text-orange-900 border-orange-300',
          accentColor: 'orange',
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Partially Correct!',
          subtitle: 'Good effort',
          scoreSubtitle: 'Keep trying!',
          accentTextClass: 'text-orange-100',
          accentBgClass: 'bg-white/20',
          iconAccent: <Zap className="w-4 h-4 text-white" />,
          iconBgClass: 'bg-orange-500',
          scoreTextClass: 'text-orange-800',
          scoreSmallTextClass: 'text-orange-600',
          pointsDisplay: `+${points}`,
          explanationBg: 'bg-orange-50',
          explanationBorder: 'border-orange-400',
          explanationTitle: 'Explanation'
        };
      case 'wrong':
        return {
          gradientClass: 'from-red-500 to-rose-600',
          scoreGradientClass: 'from-red-50 via-rose-50 to-red-50',
          badgeClass: 'bg-red-200 text-red-900 border-red-300',
          accentColor: 'red',
          icon: <X className="w-6 h-6" />,
          title: 'Not Quite!',
          subtitle: 'Let\'s learn together',
          scoreSubtitle: 'Learning opportunity',
          accentTextClass: 'text-red-100',
          accentBgClass: 'bg-white/20',
          iconAccent: <BookOpen className="w-4 h-4 text-white" />,
          iconBgClass: 'bg-red-500',
          scoreTextClass: 'text-red-800',
          scoreSmallTextClass: 'text-red-600',
          pointsDisplay: '+0',
          explanationBg: 'bg-red-50',
          explanationBorder: 'border-red-400',
          explanationTitle: 'Correct Answer'
        };
      default:
        return {
          gradientClass: 'from-gray-500 to-gray-600',
          scoreGradientClass: 'from-gray-50 via-gray-50 to-gray-50',
          badgeClass: 'bg-gray-200 text-gray-900 border-gray-300',
          accentColor: 'gray',
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Result',
          subtitle: 'Review your answer',
          scoreSubtitle: 'Current progress',
          accentTextClass: 'text-gray-100',
          accentBgClass: 'bg-white/20',
          iconAccent: <Zap className="w-4 h-4 text-white" />,
          iconBgClass: 'bg-gray-500',
          scoreTextClass: 'text-gray-800',
          scoreSmallTextClass: 'text-gray-600',
          pointsDisplay: `+${points}`,
          explanationBg: 'bg-gray-50',
          explanationBorder: 'border-gray-400',
          explanationTitle: 'Information'
        };
    }
  };

  const config = getOutcomeConfig();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl border-0 overflow-hidden">
        {/* Header Bar */}
        <div className={`bg-gradient-to-r ${config.gradientClass} px-6 py-4`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${config.accentBgClass} rounded-full flex items-center justify-center animate-bounce`}>
                {config.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold animate-slide-in-left">{config.title}</h2>
                <p className={`${config.accentTextClass} text-sm animate-fade-in`}>{config.subtitle}</p>
              </div>
            </div>
            <div className="text-right animate-slide-in-right">
              <div className="text-2xl font-bold">{config.pointsDisplay}</div>
              <div className={`${config.accentTextClass} text-xs`}>Points</div>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Enhanced Score Section */}
          <div className={`bg-gradient-to-r ${config.scoreGradientClass} border-b px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${config.iconBgClass} rounded-full flex items-center justify-center animate-bounce-slow`}>
                  {config.iconAccent}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 animate-slide-in-left">Current Score</div>
                  <div className={`text-xs ${config.scoreSmallTextClass} animate-fade-in`}>{config.scoreSubtitle}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right animate-slide-in-right">
                  <div className={`text-lg font-bold ${config.scoreTextClass} tabular-nums`}>{animatedScore}</div>
                  <div className={`text-xs ${config.scoreSmallTextClass}`}>Total</div>
                </div>
                <Badge className={`${config.badgeClass} animate-pulse-scale px-3 py-1`}>
                  <Star className="w-3 h-3 mr-1 animate-spin-slow" />
                  Level {level + 1}
                </Badge>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            <div className={`${config.explanationBg} rounded-lg p-4 border-l-4 ${config.explanationBorder} animate-fade-in-up`}>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <div className={`w-2 h-2 ${config.iconBgClass} rounded-full`}></div>
                {config.explanationTitle}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {explanation || "No additional explanation available."}
              </p>
            </div>

            {/* Action Area */}
            <div className="flex justify-end pt-2">
              <Button 
                onClick={onContinue} 
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 animate-slide-in-right group">
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
