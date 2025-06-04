import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import gsap from 'gsap';
import ExtraLifeModal from './ExtraLife';
import ScoreBoosterModal from './ScoreBoost';

export interface PowerUp {
  id: number;
  name: string;
  description: string;
  power_up_type: string;
  power_up_type_display: string;
  image?: string;
  bonus_lives: number;
  score_multiplier: number;
  time_extension_seconds: number;
  user_power_up_id?: number; // ID for the user's instance of this power-up
}

interface PowerUpModalProps {
  powerUp: PowerUp | null;
  isOpen: boolean;
  onClose: () => void;
}

const PowerUpModal: React.FC<PowerUpModalProps> = ({ 
  powerUp, 
  isOpen, 
  onClose
}) => {
  // Determine if this is an extra life or score booster powerup
  const isExtraLife = powerUp && powerUp.bonus_lives && powerUp.bonus_lives > 0;
  const isScoreBooster = powerUp && powerUp.score_multiplier && powerUp.score_multiplier > 1;
  // Create refs for the elements we want to animate
  const iconRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const effectsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bonusLivesRef = useRef<HTMLLIElement>(null);
  const scoreMultiplierRef = useRef<HTMLLIElement>(null);

  // GSAP animations when the modal is displayed
  useEffect(() => {
    if (isOpen && powerUp && iconRef.current) {
      // Store refs in variables for cleanup
      const iconElement = iconRef.current;
      const buttonElement = buttonRef.current;
      const effectsElement = effectsRef.current;
      const titleElement = titleRef.current;
      const bonusLivesElement = bonusLivesRef.current;
      const scoreMultiplierElement = scoreMultiplierRef.current;
      
      // Animate the power-up icon with a bounce effect
      gsap.fromTo(iconElement, 
        { scale: 0, rotation: -45 },
        { 
          scale: 1, 
          rotation: 0, 
          duration: 1.2, 
          ease: "elastic.out(1, 0.3)",
          delay: 0.3
        }
      );

      // Animate the effects section container
      if (effectsElement) {
        gsap.fromTo(effectsElement,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.8 }
        );
        
        // Animate the bonus lives text if present
        if (bonusLivesElement) {
          const bonusLivesChars = bonusLivesElement.querySelectorAll('span');
          
          gsap.fromTo(bonusLivesElement,
            { opacity: 0 },
            { opacity: 1, duration: 0.1, delay: 1.0 }
          );
          
          gsap.fromTo(bonusLivesChars,
            { opacity: 0, y: 10, scale: 0.8 },
            { 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              duration: 0.1,
              stagger: 0.03,
              delay: 1.0,
              ease: "power2.out"
            }
          );
        }
        
        // Animate the score multiplier text if present
        if (scoreMultiplierElement) {
          const scoreMultiplierChars = scoreMultiplierElement.querySelectorAll('span');
          
          gsap.fromTo(scoreMultiplierElement,
            { opacity: 0 },
            { opacity: 1, duration: 0.1, delay: 1.3 }
          );
          
          gsap.fromTo(scoreMultiplierChars,
            { opacity: 0, y: 10, scale: 0.8 },
            { 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              duration: 0.1,
              stagger: 0.03,
              delay: 1.3,
              ease: "power2.out"
            }
          );
        }
      }

      // Animate the title with a character-by-character typing effect
      if (titleElement) {
        // Get all character spans within the title
        const chars = titleElement.querySelectorAll('span');
        
        // Stagger reveal each character with a typing effect
        gsap.fromTo(chars,
          { 
            opacity: 0,
            y: -20,
            scale: 0
          },
          { 
            opacity: 1, 
            y: 0,
            scale: 1,
            duration: 0.15,
            stagger: 0.05,  // 50ms delay between each character
            ease: "back.out(2)",
            delay: 0.2
          }
        );
        
        // Add a highlight animation after all characters are revealed
        const totalTypingDuration = 0.2 + (chars.length * 0.05);
        gsap.to(chars, {
          color: "#FF8800",
          duration: 0.3,
          delay: totalTypingDuration + 0.3,
          yoyo: true,
          repeat: 1,
          stagger: 0.02
        });
      }

      // Animate the button with a pulse effect
      if (buttonElement) {
        // Initial appearance
        gsap.fromTo(buttonElement,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, delay: 1 }
        );

        // Ongoing pulse animation
        gsap.to(buttonElement, {
          scale: 1.05,
          repeat: -1,
          yoyo: true,
          duration: 0.8,
          delay: 1.5
        });
      }
      
      // Cleanup animation when modal closes
      return () => {
        gsap.killTweensOf(iconElement);
        gsap.killTweensOf(buttonElement);
        gsap.killTweensOf(effectsElement);
        gsap.killTweensOf(titleElement);
        gsap.killTweensOf(bonusLivesElement);
        gsap.killTweensOf(scoreMultiplierElement);
      };
    }
    return () => {}; // Empty cleanup function for when condition is not met
  }, [isOpen, powerUp]);
  
  if (!powerUp) return null;

  // Determine what icon/image to show based on powerUp type
  const getPowerUpIcon = () => {
    switch (powerUp.power_up_type) {
      case 'extra_life':
        return '❤️';
      case 'score_boost':
        return '🚀';
      case 'time_extension':
        return '⏱️';
      case 'hint':
        return '💡';
      default:
        return '🎁';
    }
  };

  // Use specialized components for specific power-up types
  if (isOpen && powerUp && isExtraLife) {
    return <ExtraLifeModal onClose={onClose} />;
  }

  if (isOpen && powerUp && isScoreBooster) {
    return <ScoreBoosterModal onClose={onClose} />;
  }
  
  // Default power-up modal for other types
  return (
    <AnimatePresence>
      {isOpen && powerUp && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 m-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 ref={titleRef} className="text-base font-bold text-primary">
                {"Power-Up Earned!".split("").map((char, index) => (
                  <span key={index} className="inline-block opacity-0">{char === " " ? "\u00A0" : char}</span>
                ))}
              </h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <div className="text-6xl mb-4" ref={iconRef}>
                {powerUp.image ? (
                  <Image 
                    src={powerUp.image} 
                    alt={powerUp.name} 
                    width={96}
                    height={96}
                    className="w-24 h-24 object-contain"
                  />
                ) : (
                  <span className="text-5xl">{getPowerUpIcon()}</span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100">
                {powerUp.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
                {powerUp.description}
              </p>
              
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg w-full" ref={effectsRef}>
                <ul className="space-y-1">
                  {powerUp.bonus_lives > 0 && (
                    <li ref={bonusLivesRef} className="text-green-700 dark:text-gray-300 opacity-0">
                      {`+${powerUp.bonus_lives} Extra ${powerUp.bonus_lives === 1 ? 'Life' : 'Lives'}`.split('').map((char, index) => (
                        <span key={index} className="inline-block">{char === " " ? "\u00A0" : char}</span>
                      ))}
                    </li>
                  )}
                  {powerUp.score_multiplier > 1 && (
                    <li ref={scoreMultiplierRef} className="text-purple-700 dark:text-gray-300 opacity-0">
                      {`${powerUp.score_multiplier}x Score Multiplier`.split('').map((char, index) => (
                        <span key={index} className="inline-block">{char === " " ? "\u00A0" : char}</span>
                      ))}
                    </li>
                  )}
                  {powerUp.time_extension_seconds > 0 && (
                    <li className="text-gray-700 dark:text-gray-300">
                      +{powerUp.time_extension_seconds} Seconds
                    </li>
                  )}
                  {powerUp.power_up_type === 'hint' && (
                    <li className="text-gray-700 dark:text-gray-300">
                      Provides a helpful hint
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                ref={buttonRef}
                onClick={onClose}
                className="bg-black hover:bg-gray-700 text-white px-3 py-1.5 text-sm rounded-md transition-colors duration-200"
              >
                Continue Playing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PowerUpModal;
