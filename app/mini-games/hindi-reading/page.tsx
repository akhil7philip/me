"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { hindiTexts, HindiText } from "@/data/mini-games/hindi-texts";
import confetti from 'canvas-confetti';

// Ideal reading speeds (characters per minute)
const idealReadingSpeeds = {
  beginner: 150,
  intermediate: 250,
  advanced: 350
};

export default function HindiReading() {
  const [gameState, setGameState] = useState("ready"); // ready, playing, finished, completed
  const [currentText, setCurrentText] = useState<HindiText | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [readingSpeeds, setReadingSpeeds] = useState<number[]>([]);
  const [averageSpeed, setAverageSpeed] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [sessionCount, setSessionCount] = useState(0);
  const [usedTextsInSession, setUsedTextsInSession] = useState<HindiText[]>([]);
  const MAX_SESSIONS = 3;

  // Get a random Hindi text based on selected difficulty that hasn't been used in the current session
  const getRandomText = () => {
    const filteredTexts = hindiTexts.filter(text => 
      text.difficulty === difficulty && 
      !usedTextsInSession.some(usedText => usedText.hindi === text.hindi)
    );
    
    // If all texts of this difficulty have been used in this session, show an error or reset
    if (filteredTexts.length === 0) {
      // This is a fallback that should rarely happen unless there are very few texts
      // We could reset the used texts, but for now we'll just use any text of the right difficulty
      const anyTextOfRightDifficulty = hindiTexts.filter(text => text.difficulty === difficulty);
      const randomIndex = Math.floor(Math.random() * anyTextOfRightDifficulty.length);
      return anyTextOfRightDifficulty[randomIndex];
    }
    
    const randomIndex = Math.floor(Math.random() * filteredTexts.length);
    return filteredTexts[randomIndex];
  };

  // Start the game
  const startGame = () => {
    setGameState("playing");
    const newText = getRandomText();
    setCurrentText(newText);
    setUsedTextsInSession([...usedTextsInSession, newText]);
    setStartTime(Date.now());
    setShowTranslation(false);
  };

  // Finish reading the current text
  const finishReading = () => {
    if (startTime && currentText) {
      const endTimeMs = Date.now();
      setEndTime(endTimeMs);
      
      // Calculate reading speed (characters per minute)
      const durationInMinutes = (endTimeMs - startTime) / 60000;
      const charactersRead = currentText.hindi.length;
      const speed = Math.round(charactersRead / durationInMinutes);
      
      // Update reading speeds
      const newReadingSpeeds = [...readingSpeeds, speed];
      setReadingSpeeds(newReadingSpeeds);
      
      // Calculate average speed
      const sum = newReadingSpeeds.reduce((acc, curr) => acc + curr, 0);
      setAverageSpeed(Math.round(sum / newReadingSpeeds.length));
      
      // Update session count
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      // Check if we've reached the maximum number of sessions
      if (newSessionCount >= MAX_SESSIONS) {
        setGameState("completed");
        // Trigger confetti after a short delay
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 500);
      } else {
        setGameState("finished");
      }
    }
  };

  // Continue to the next text
  const nextText = () => {
    startGame();
  };

  // Reset the game
  const resetGame = () => {
    setGameState("ready");
    setCurrentText(null);
    setStartTime(null);
    setEndTime(null);
    setReadingSpeeds([]);
    setAverageSpeed(null);
    setShowTranslation(false);
    setSessionCount(0);
    setUsedTextsInSession([]); // Reset the used texts when starting a new game
  };

  // Get progress percentage based on current speed and difficulty
  const getProgressPercentage = (speed: number) => {
    const targetSpeed = idealReadingSpeeds[difficulty];
    const percentage = (speed / targetSpeed) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-6">
        <div className="flex items-center relative mb-4">
          <Link href="/mini-games" className="absolute left-0 z-10">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span className="sr-only">Back to Games</span>
            </Button>
          </Link>
          <div className="w-full text-center">
            <h1 className="text-3xl font-bold">Hindi Speed Reading</h1>
            <p className="text-gray-500">Test and improve your Hindi reading speed</p>
          </div>
        </div>
      </header>

      <Alert className="mb-6">
        <AlertDescription>
          <div className="text-sm space-y-1">
            <p><strong>Ideal Reading Speeds (characters per minute):</strong></p>
            <p>Beginner: {idealReadingSpeeds.beginner} CPM</p>
            <p>Intermediate: {idealReadingSpeeds.intermediate} CPM</p>
            <p>Advanced: {idealReadingSpeeds.advanced} CPM</p>
            <p className="mt-2">Complete {MAX_SESSIONS} sessions to see your average speed!</p>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">Hindi Speed Reading Test</CardTitle>
          <CardDescription className="text-center">
            Test how quickly you can read Hindi text. Select a difficulty level, click "Start" to begin, and "Finished Reading" when you're done.
          </CardDescription>
          <div className="text-sm text-muted-foreground mt-2 text-center">
            Session {sessionCount} of {MAX_SESSIONS}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {gameState === "ready" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-medium">Select Difficulty</h3>
                <RadioGroup 
                  defaultValue="beginner" 
                  value={difficulty}
                  onValueChange={(value) => setDifficulty(value as 'beginner' | 'intermediate' | 'advanced')}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner">Beginner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Intermediate</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex justify-center">
                <Button onClick={startGame}>Start</Button>
              </div>
            </div>
          )}

          {gameState === "playing" && currentText && (
            <div className="space-y-6">
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-2xl text-center">{currentText.hindi}</p>
              </div>
              
              <div className="flex items-center space-x-2 justify-end">
                <Switch
                  id="show-translation"
                  checked={showTranslation}
                  onCheckedChange={setShowTranslation}
                />
                <Label htmlFor="show-translation">Show Translation</Label>
              </div>
              
              {showTranslation && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-lg text-center">{currentText.english}</p>
                </div>
              )}
              
              <div className="flex justify-center">
                <Button onClick={finishReading}>Finished Reading</Button>
              </div>
            </div>
          )}

          {gameState === "finished" && (
            <div className="space-y-6">
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-2xl text-center">{currentText?.hindi}</p>
                <p className="text-lg text-center mt-4">{currentText?.english}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-center font-medium">
                  Reading Speed: {readingSpeeds[readingSpeeds.length - 1]} characters per minute
                </p>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Your speed:</span>
                    <span>{readingSpeeds[readingSpeeds.length - 1]} CPM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Target for {difficulty}:</span>
                    <span>{idealReadingSpeeds[difficulty]} CPM</span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(readingSpeeds[readingSpeeds.length - 1])} 
                    className="h-2" 
                  />
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={nextText}>Next Text</Button>
                <Button variant="outline" onClick={resetGame}>Reset</Button>
              </div>
            </div>
          )}

          {gameState === "completed" && (
            <div className="space-y-6">
              <div className="bg-primary/10 p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
                <p className="text-lg">You've completed all {MAX_SESSIONS} sessions!</p>
                <p className="text-2xl font-bold mt-4">Your Average Speed: {averageSpeed} CPM</p>
                <p className="text-sm mt-2">
                  {averageSpeed && averageSpeed >= idealReadingSpeeds[difficulty] 
                    ? "Great job! You've reached the target speed for your level!" 
                    : "Keep practicing to improve your speed!"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={averageSpeed ? getProgressPercentage(averageSpeed) : 0} 
                  className="h-3" 
                />
                <div className="flex justify-between text-sm">
                  <span>Your average:</span>
                  <span>{averageSpeed} CPM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Target for {difficulty}:</span>
                  <span>{idealReadingSpeeds[difficulty]} CPM</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={resetGame}>Start New Session</Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          {readingSpeeds.length > 0 && (
            <div className="w-full space-y-2">
              <h3 className="font-medium">Session History</h3>
              <div className="space-y-1">
                {readingSpeeds.map((speed, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>Reading {index + 1}:</span>
                    <span>{speed} characters per minute</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 