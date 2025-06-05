"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import type { Action, Scenarios } from "./StorylineGame"

interface MobileUiProps {
  selectedScenario: Scenarios | null;
  onActionSelected: (action: Action) => void;
}

export default function MobileUi({ selectedScenario, onActionSelected }: MobileUiProps) {
    const [showActions, setShowActions] = useState(false)
  
    const handleChoice = (action: Action) => {
      onActionSelected(action)
      setShowActions(false)
    }
  
    const handleTakeAction = () => {
      setShowActions(true)
    }
  
    const handleBack = () => {
      setShowActions(false)
    }
  
    if (!selectedScenario) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
          <div>Loading scenario…</div>
        </div>
      )
    }
  
    return (
      <div className="flex-1 flex flex-col gamecard mx-auto max-w-6xl h-full">
        <div className="grid grid-cols-[1fr_2fr] h-full">
          {/* Story Image */}
          <div className="relative h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 blur-xl opacity-30" />
            <Card className="relative shadow-2xl border-0 overflow-hidden h-full">
              {selectedScenario.image ? (
                <Image
                  src={selectedScenario.image}
                  alt="Scenario illustration"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </Card>
          </div>
  
          {/* Scenario Text / Action Buttons */}
          <div className="flex flex-col">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
              <CardContent className="p-4 h-full flex flex-col justify-center overflow-y-auto">
                {!showActions ? (
                  <>
                    <p className="text-sm font-bold text-gray-700 mb-8">
                      {selectedScenario.description}
                    </p>
  
                    {/* Use handleTakeAction */}
                    <Button
                      onClick={handleTakeAction}
                      size="lg"
                      className="w-full bg-black text-white py-4 rounded-lg shadow-lg"
                    >
                      Take Action
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-4">
                    {/* Use handleBack */}
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
  
                    <div className="space-y-2">
                      {selectedScenario.actions.map((action) => (
                        <Button
                          key={action.id}
                          // Use handleChoice
                          onClick={() => handleChoice(action)}
                          className="w-full p-3 text-sm font-medium text-white bg-black rounded-lg whitespace-normal"
                        >
                          {action.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
