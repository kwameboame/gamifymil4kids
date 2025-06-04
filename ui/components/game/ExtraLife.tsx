"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, X, Sparkles } from "lucide-react"

interface ExtraLifeModalProps {
  onClose?: () => void;
}

export default function ExtraLifeModal({ onClose }: ExtraLifeModalProps = {}) {
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
        <div className="bg-gradient-to-r from-blue-500 to-purple-700 px-6 py-6 text-center">
          <div className="animate-slide-in-up">
            <h1 className="text-2xl font-bold text-white mb-2">Power-Up Earned!</h1>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-bounce-heart">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Main Content */}
          <div className="px-6 py-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 animate-slide-in-left">Extra Life</h2>
            <p className="text-gray-600 mb-6 animate-fade-in">Gives you an extra life!</p>

            {/* Power-up Badge */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 animate-slide-in-up">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600 animate-spin-slow" />
                <span className="text-lg font-semibold text-green-600">+1 Extra Life</span>
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

        @keyframes bounce-heart {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
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

        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out 0.2s both;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out 0.4s both;
        }

        .animate-bounce-heart {
          animation: bounce-heart 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
