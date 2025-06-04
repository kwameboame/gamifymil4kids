"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function StorylineGame() {
  const [showActions, setShowActions] = useState(false)

  const handleChoice = (choice: string) => {
    console.log(`Player chose: ${choice}`)
    // Handle the player's choice here - could advance to next scenario
    setShowActions(false) // Reset for demo purposes
  }

  const handleTakeAction = () => {
    setShowActions(true)
  }

  const handleBack = () => {
    setShowActions(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-0 items-stretch">
          {/* Story Image */}
          <div className="order-1">
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur-xl opacity-30"></div>
              <Card className="relative shadow-2xl border-0 overflow-hidden h-full">
                <div className="h-full relative">
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    alt="Adjoa looking at her phone with a social media post visible on the screen"
                    fill
                    className="object-cover"
                    priority
                  />
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">The Social Media Dilemma</h1>
                    <p className="text-base md:text-lg leading-relaxed text-gray-700 mb-8">
                      <One Saturday afternoon, Adjoa took her sister's phone to check what's happening on Facebook. While
                      scrolling through her feed, Adjoa comes across a post that catches her attention. One of her
                      favourites and a popular celebrity had posted: "Drinking ginger tea every morning will keep you
                      from getting sick forever!" The post had over 10k likes and shares, and it seems everyone is
                      talking about it.>
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
                      <Button
                        onClick={() => handleChoice("share")}
                        className="w-full h-auto p-4 md:p-6 text-sm md:text-base font-medium text-white bg-black hover:bg-gray-800 transition-colors duration-200 rounded-lg whitespace-normal"
                      >
                        <span className="text-center leading-relaxed break-words">
                          Share it with your friends because it sounds helpful and would save lives.
                        </span>
                      </Button>

                      <Button
                        onClick={() => handleChoice("research")}
                        className="w-full h-auto p-4 md:p-6 text-sm md:text-base font-medium text-white bg-black hover:bg-gray-800 transition-colors duration-200 rounded-lg whitespace-normal"
                      >
                        <span className="text-center leading-relaxed break-words">
                          Ask her elder sister and look it up online to see if it's true.
                        </span>
                      </Button>

                      <Button
                        onClick={() => handleChoice("ignore")}
                        className="w-full h-auto p-4 md:p-6 text-sm md:text-base font-medium text-white bg-black hover:bg-gray-800 transition-colors duration-200 rounded-lg whitespace-normal"
                      >
                        <span className="text-center leading-relaxed break-words">Ignore it and keep scrolling.</span>
                      </Button>
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
