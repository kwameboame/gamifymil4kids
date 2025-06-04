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
    onActionSelected(action);
    setShowActions(false);
  }

  const handleTakeAction = () => {
    setShowActions(true)
  }

  const handleBack = () => {
    setShowActions(false)
  }

  if (!selectedScenario) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div>Loading scenario...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-2 gap-0 items-stretch">
          {/* Story Image */}
          <div className="order-1">
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur-xl opacity-30"></div>
              <Card className="relative shadow-2xl border-0 overflow-hidden h-full">
                <div className="h-full relative">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </Card>
            </div>
          </div>

          {/* Scenario Text / Action Buttons */}
          <div className="order-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
              <CardContent className="p-6 md:p-8 h-full flex flex-col justify-center">
                {!showActions ? (
                  <>
                    <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-8">
                      {selectedScenario.description}
                    </p>

                    <Button
                      onClick={handleTakeAction}
                      size="lg"
                      className="w-full md:w-auto bg-black hover:bg-gray-800 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Take Action
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* Back Button */}
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="mb-4 bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>

                    <div className="space-y-4">
                      {selectedScenario.actions.map((action) => (
                        <Button
                          key={action.id}
                          onClick={() => handleChoice(action)}
                          className="w-full h-auto p-4 md:p-6 text-sm md:text-base font-medium text-white bg-black hover:bg-gray-800 transition-colors duration-200 rounded-lg whitespace-normal"
                        >
                          <span className="text-center leading-relaxed break-words">
                            {action.text}
                          </span>
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
    </div>
  )
}
