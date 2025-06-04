"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, X, Zap } from "lucide-react"

interface ScoreBoosterModalProps {
  onClose?: () => void;
}

export default function ScoreBoosterModal({ onClose }: ScoreBoosterModalProps = {}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl border-0 overflow-hidden relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors animate-fade-in"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Bar */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-6 text-center">
          <div className="animate-slide-in-up">
            <h1 className="text-2xl font-bold text-white mb-2">Power-Up Earned!</h1>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-bounce-gift">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Main Content */}
          <div className="px-6 py-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 animate-slide-in-left">Score Booster</h2>
            <p className="text-gray-600 mb-6 animate-fade-in">Doubles your current score!</p>

            {/* Power-up Badge */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 animate-slide-in-up">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-purple-600 animate-pulse-zap" />
                <span className="text-lg font-semibold text-purple-600">2x Score Multiplier</span>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={onClose}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-200 hover:scale-105 animate-slide-in-up"
            >
              Continue Playing
            </Button>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
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

        @keyframes bounce-gift {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
        }

        @keyframes pulse-zap {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out 0.2s both;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out 0.4s both;
        }

        .animate-bounce-gift {
          animation: bounce-gift 2s ease-in-out infinite;
        }

        .animate-pulse-zap {
          animation: pulse-zap 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
