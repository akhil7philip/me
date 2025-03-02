"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import confetti from 'canvas-confetti';
import { supabase, Player, GameSession } from "@/lib/supabase";

export default function CowsAndBulls() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [joiningSession, setJoiningSession] = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");
  const [error, setError] = useState("");
  const [digit_length, setDigitLength] = useState<4 | 5 | 6>(4);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareLinkRef = useRef<HTMLInputElement>(null);
  
  // Check for session ID in URL when component mounts
  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('session');
    if (sessionIdFromUrl) {
      // Always normalize session ID to lowercase for consistency
      const normalizedSessionId = sessionIdFromUrl.toLowerCase();
      setSessionId(normalizedSessionId);
      
      // Check if there's a game session for this ID and auto-join
      const checkExistingSessionAndJoin = async () => {
        try {
          // First check if we have a stored player ID for this session
          const storedPlayerId = typeof window !== 'undefined' ? 
            localStorage.getItem(`cowsAndBulls_playerId_${normalizedSessionId}`) : null;
          
          // Fetch the session data
          const { data: existingSession, error } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('id', normalizedSessionId)
            .single();
            
          if (error) {
            console.error('Error fetching game session:', error);
            return;
          }
          
          if (existingSession) {
            // If user already has a player ID for this session
            if (storedPlayerId) {
              const existingPlayer = existingSession.players.find((p: Player) => p.id === storedPlayerId);
              
              if (existingPlayer) {
                // If player exists but is inactive, reactivate them
                if (existingPlayer.active === false) {
                  const updatedPlayers = existingSession.players.map((p: Player) => {
                    if (p.id === storedPlayerId) {
                      return { ...p, active: true };
                    }
                    return p;
                  });
                  
                  // Update the session with the reactivated player
                  await supabase
                    .from('game_sessions')
                    .update({ ...existingSession, players: updatedPlayers })
                    .eq('id', normalizedSessionId);
                  
                  setCurrentPlayerId(storedPlayerId);
                  setGameSession({ ...existingSession, players: updatedPlayers });
                  setPlayerName(existingPlayer.name);
                  setShowInstructions(false);
                } else {
                  // Player is already active, just join
                  setCurrentPlayerId(storedPlayerId);
                  setGameSession(existingSession);
                  setPlayerName(existingPlayer.name);
                  setShowInstructions(false);
                }
              }
            } else {
              // No stored player ID, but we have a session from URL
              // Show the join form with pre-filled session ID
              // Get player name, then auto-join when they submit it
              setShowInstructions(true);
            }
          }
        } catch (err) {
          console.error('Error checking existing session:', err);
        }
      };
      
      checkExistingSessionAndJoin();
    }
  }, [searchParams]);

  // Subscribe to real-time updates for the game session
  useEffect(() => {
    if (!sessionId) return;

    // First, try to fetch the current game state
    const fetchGameSession = async () => {
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
          
        if (error) {
          console.error('Error fetching game session:', error);
          return;
        }
        
        if (data) {
          setGameSession(data);
          
          // Check if we have a stored player ID for this session
          const storedPlayerId = typeof window !== 'undefined' ? localStorage.getItem(`cowsAndBulls_playerId_${sessionId}`) : null;
          
          // If stored ID matches a player in the session, auto-join
          if (storedPlayerId && data.players.some((p: Player) => p.id === storedPlayerId)) {
            setCurrentPlayerId(storedPlayerId);
            setShowInstructions(false);
            
            // Get player ready status
            const playerInSession = data.players.find((p: Player) => p.id === storedPlayerId);
            if (playerInSession) {
              setIsPlayerReady(playerInSession.ready);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching game session:', err);
      }
    };

    fetchGameSession();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`game_${sessionId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`
        }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          setGameSession(payload.new as GameSession);
        }
      )
      .subscribe();

    // Cleanup subscription when component unmounts or sessionId changes
    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  const generateId = () => {
    // Generate an ID and normalize to lowercase for consistent handling
    return Math.random().toString(36).substring(2, 9).toLowerCase();
  };
  
  const generateSecretNumber = (length: number) => {
    const digits = '0123456789';
    let result = '';
    const digitsArray = digits.split('');
    
    // Fisher-Yates shuffle
    for (let i = digitsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digitsArray[i], digitsArray[j]] = [digitsArray[j], digitsArray[i]];
    }
    
    // Take the first 'length' digits from the shuffled array
    result = digitsArray.slice(0, length).join('');
    
    return result;
  };

  const createSession = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    
    const newSessionId = generateId();
    const playerId = generateId();
    
    const newSession = {
      id: newSessionId, // Already lowercase from generateId
      secret_number: generateSecretNumber(digit_length),
      players: [{
        id: playerId,
        name: playerName,
        ready: false,
        active: true,
        guesses: [],
      }],
      current_player_index: 0,
      digit_length: digit_length,
      winner: null,
      game_started: false,
      created_at: new Date().toISOString(),
    };
    
    try {
      // Insert the new game session into Supabase
      const { data, error } = await supabase
        .from('game_sessions')
        .insert(newSession)
        .select()
        .single();
      
      if (error) {
        setError(`Error creating game session: ${error.message}`);
        return;
      }
      
      // Update URL with session ID
      const url = new URL(window.location.href);
      url.searchParams.set('session', newSessionId);
      window.history.pushState({}, '', url.toString());
      
      setGameSession(newSession);
      setCurrentPlayerId(playerId);
      setSessionId(newSessionId);
      setShowInstructions(false);
      setError("");
    } catch (err) {
      setError(`Error creating game session: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Join an existing game session
  const joinSession = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    
    if (!sessionId.trim()) {
      setError("Please enter a session ID");
      return;
    }
    
    // Ensure session ID is always lowercase for consistency
    const normalizedSessionId = sessionId.toLowerCase();
    setSessionId(normalizedSessionId);
    
    setJoiningSession(true);
    
    try {
      // Fetch the current game session
      const { data: existingSession, error: fetchError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', normalizedSessionId)
        .single();
      
      if (fetchError) {
        setError(`Session not found: ${fetchError.message}`);
        setJoiningSession(false);
        return;
      }
      
      // Check if the current player is already in the game using stored ID
      const storedPlayerId = typeof window !== 'undefined' ? localStorage.getItem(`cowsAndBulls_playerId_${normalizedSessionId}`) : null;
      
      // If we have a stored player ID and that player is in the session
      if (storedPlayerId) {
        const existingPlayer = existingSession.players.find((p: Player) => p.id === storedPlayerId);
        
        if (existingPlayer) {
          // If player exists but is inactive, reactivate them
          if (existingPlayer.active === false) {
            const updatedPlayers = existingSession.players.map((p: Player) => {
              if (p.id === storedPlayerId) {
                return { ...p, active: true };
              }
              return p;
            });
            
            // Update the session with the reactivated player
            const { error: updateError } = await supabase
              .from('game_sessions')
              .update({ ...existingSession, players: updatedPlayers })
              .eq('id', normalizedSessionId);
            
            if (updateError) {
              setError(`Error rejoining session: ${updateError.message}`);
              setJoiningSession(false);
              return;
            }
            
            setCurrentPlayerId(storedPlayerId);
            setGameSession({ ...existingSession, players: updatedPlayers });
            setShowInstructions(false);
            setJoiningSession(false);
            return;
          }
          
          // If player is already active, just join
          setCurrentPlayerId(storedPlayerId);
          setGameSession(existingSession);
          setShowInstructions(false);
          setJoiningSession(false);
          return;
        }
      }
      
      // Generate a new player ID
      const playerId = generateId();
      
      // Add the new player to the existing session
      const updatedSession = {
        ...existingSession,
        players: [
          ...existingSession.players,
          {
            id: playerId,
            name: playerName,
            ready: false,
            active: true,
            guesses: [],
          }
        ]
      };
      
      // Update the game session in Supabase
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update(updatedSession)
        .eq('id', normalizedSessionId);
      
      if (updateError) {
        setError(`Error joining session: ${updateError.message}`);
        setJoiningSession(false);
        return;
      }
      
      // Store the player ID in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`cowsAndBulls_playerId_${normalizedSessionId}`, playerId);
      }
      
      setCurrentPlayerId(playerId);
      setGameSession(updatedSession);
      setShowInstructions(false);
      setError("");
    } catch (err) {
      setError(`Error joining session: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setJoiningSession(false);
    }
  };

  // Toggle player ready status
  const toggleReady = async () => {
    if (!gameSession || !currentPlayerId) return;
    
    const updatedPlayers = gameSession.players.map(player => {
      if (player.id === currentPlayerId) {
        return { ...player, ready: !player.ready };
      }
      return player;
    });
    
    const updatedSession = {
      ...gameSession,
      players: updatedPlayers
    };
    
    try {
      // Update the game session in Supabase
      const { error } = await supabase
        .from('game_sessions')
        .update(updatedSession)
        .eq('id', gameSession.id);
        
      if (error) {
        setError(`Error updating ready status: ${error.message}`);
        return;
      }
      
      setIsPlayerReady(!isPlayerReady);
      
      // Check if all players are ready to start the game
      const allReady = updatedPlayers.every(player => player.ready);
      if (allReady && updatedPlayers.length > 1 && !gameSession.game_started) {
        startGame();
      }
    } catch (err) {
      setError(`Error updating ready status: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Start the game when all players are ready
  const startGame = async () => {
    if (!gameSession || !currentPlayerId) return;
    
    const updatedSession = {
      ...gameSession,
      game_started: true,
    };
    
    try {
      // Update the game session in Supabase
      const { error } = await supabase
        .from('game_sessions')
        .update(updatedSession)
        .eq('id', gameSession.id);
        
      if (error) {
        setError(`Error starting game: ${error.message}`);
        return;
      }
    } catch (err) {
      setError(`Error starting game: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Submit a guess
  const submitGuess = async () => {
    if (!gameSession || !currentPlayerId) return;
    
    // Check if it's the current player's turn
    const currentPlayerIdx = gameSession.players.findIndex(p => p.id === currentPlayerId);
    if (currentPlayerIdx !== gameSession.current_player_index) {
      setError("It's not your turn!");
      return;
    }
    
    // Validate guess
    if (currentGuess.length !== gameSession.digit_length) {
      setError(`Your guess must be ${gameSession.digit_length} digits long`);
      return;
    }
    
    if (!/^\d+$/.test(currentGuess)) {
      setError("Your guess must contain only digits");
      return;
    }
    
    // Check for repeating digits
    const digits = new Set(currentGuess.split(''));
    if (digits.size !== currentGuess.length) {
      setError("Your guess cannot contain repeating digits");
      return;
    }
    
    // Calculate bulls and cows
    let bulls = 0;
    let cows = 0;
    
    for (let i = 0; i < currentGuess.length; i++) {
      if (currentGuess[i] === gameSession.secret_number[i]) {
        bulls++;
      } else if (gameSession.secret_number.includes(currentGuess[i])) {
        cows++;
      }
    }
    
    // Update the game session
    const updatedPlayers = gameSession.players.map(player => {
      if (player.id === currentPlayerId) {
        return {
          ...player,
          guesses: [
            ...player.guesses,
            { guess: currentGuess, bulls, cows }
          ]
        };
      }
      return player;
    });
    
    // Check if the player won
    let winner = gameSession.winner;
    if (bulls === gameSession.digit_length) {
      winner = currentPlayerId;
      
      // Trigger confetti effect on win
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }
    
    // Move to the next player's turn
    let nextPlayerIndex = (gameSession.current_player_index + 1) % gameSession.players.length;
    
    const updatedSession = {
      ...gameSession,
      players: updatedPlayers,
      current_player_index: nextPlayerIndex,
      winner
    };
    
    try {
      // Update the game session in Supabase
      const { error } = await supabase
        .from('game_sessions')
        .update(updatedSession)
        .eq('id', gameSession.id);
        
      if (error) {
        setError(`Error submitting guess: ${error.message}`);
        return;
      }
      
      setCurrentGuess("");
      setError("");
    } catch (err) {
      setError(`Error submitting guess: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Check if it's the current player's turn
  const isMyTurn = () => {
    if (!gameSession || !currentPlayerId) return false;
    return gameSession.players[gameSession.current_player_index]?.id === currentPlayerId;
  };
  
  // Get the name of the current player's turn
  const getCurrentPlayerName = () => {
    if (!gameSession) return "";
    return gameSession.players[gameSession.current_player_index]?.name || "Unknown";
  };
  
  // Reset the game to play again
  const resetGame = async () => {
    if (!gameSession || !currentPlayerId) return;
    
    const new_secret_number = generateSecretNumber(gameSession.digit_length);
    const updatedPlayers = gameSession.players.map(player => ({
      ...player,
      guesses: [],
      ready: false,
    }));
    
    const updatedSession = {
      ...gameSession,
      secret_number: new_secret_number,
      players: updatedPlayers,
      current_player_index: 0,
      winner: null,
      game_started: false,
    };
    
    try {
      // Update the game session in Supabase
      const { error } = await supabase
        .from('game_sessions')
        .update(updatedSession)
        .eq('id', gameSession.id);
        
      if (error) {
        setError(`Error resetting game: ${error.message}`);
        return;
      }
      
      setIsPlayerReady(false);
    } catch (err) {
      setError(`Error resetting game: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Exit game and clean up local storage
  const exitGame = () => {
    if (sessionId && typeof window !== 'undefined') {
      localStorage.removeItem(`cowsAndBulls_playerId_${sessionId}`);
    }
    
    setCurrentPlayerId(null);
    setGameSession(null);
    setShowInstructions(true);
    setSessionId("");
    setPlayerName("");
    router.push('/mini-games/cows-and-bulls');
  };
  
  // Get the name of the winner
  const getWinnerName = () => {
    if (!gameSession || !gameSession.winner) return "";
    const winner = gameSession.players.find(p => p.id === gameSession.winner);
    return winner?.name || "Unknown";
  };
  
  // Copy the share link to clipboard
  const copyShareLink = () => {
    if (!shareLinkRef.current) return;
    
    // Create a clean URL for sharing
    const baseUrl = window.location.origin;
    const shareUrl = new URL(`${baseUrl}/mini-games/cows-and-bulls`);
    
    // Add session ID as a parameter
    if (gameSession) {
      shareUrl.searchParams.set('session', gameSession.id);
      
      // Update the input field with the clean URL
      shareLinkRef.current.value = shareUrl.toString();
    }
    
    shareLinkRef.current.select();
    document.execCommand('copy');
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // Check if all players are ready
  const areAllPlayersReady = () => {
    if (!gameSession) return false;
    
    // Only consider active players
    const activePlayers = gameSession.players.filter(player => player.active !== false);
    return activePlayers.length >= 2 && activePlayers.every(player => player.ready);
  };
  
  // Get the ready status of a specific player
  const getPlayerReadyStatus = (playerId: string) => {
    if (!gameSession) return false;
    return gameSession.players.find(p => p.id === playerId)?.ready || false;
  };
  
  // Get count of active players
  const getActivePlayerCount = () => {
    if (!gameSession) return 0;
    return gameSession.players.filter(player => player.active !== false).length;
  };
  
  // Remove a player from the game session
  const removePlayer = async (playerId: string) => {
    if (!gameSession || gameSession.game_started) return;
    
    // Can't remove yourself
    if (playerId === currentPlayerId) {
      setError("You cannot remove yourself from the game");
      return;
    }
    
    // Filter out the player to remove
    const updatedPlayers = gameSession.players.filter(player => player.id !== playerId);
    
    const updatedSession = {
      ...gameSession,
      players: updatedPlayers
    };
    
    try {
      // Update the game session in Supabase
      const { error } = await supabase
        .from('game_sessions')
        .update(updatedSession)
        .eq('id', gameSession.id);
        
      if (error) {
        setError(`Error removing player: ${error.message}`);
        return;
      }
      
      // No need to update local state as the real-time subscription will handle it
    } catch (err) {
      setError(`Error removing player: ${err instanceof Error ? err.message : String(err)}`);
    }
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
            <h1 className="text-3xl font-bold">Cows and Bulls</h1>
            <p className="text-gray-500">A multiplayer number guessing game</p>
          </div>
        </div>
      </header>
      
      {showInstructions ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Game Instructions</CardTitle>
            <CardDescription>How to play Cows and Bulls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                <strong>Objective:</strong> Guess a secret {digit_length}-digit number with no repeating digits.
              </p>
              <div className="space-y-2">
                <p><strong>Rules:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Each player takes turns guessing the secret number.</li>
                  <li>After each guess, you'll receive feedback in the form of "Bulls" and "Cows":</li>
                  <ul className="list-disc pl-6">
                    <li><strong>Bull 🐂</strong> - A digit is correct and in the right position.</li>
                    <li><strong>Cow 🐄</strong> - A digit is correct but in the wrong position.</li>
                  </ul>
                  <li>The game continues until someone correctly guesses the number (all bulls).</li>
                  <li>Other players can see the number of bulls and cows you got, but not your actual guess.</li>
                </ul>
              </div>
              
              <div className="mt-4 space-y-2">
                <p><strong>Example:</strong></p>
                <p>If the secret number is 1234 and you guess 1356:</p>
                <ul className="list-disc pl-6">
                  <li>You get 1 Bull (for the digit 1 in the correct position)</li>
                  <li>You get 1 Cow (for the digit 3 in the wrong position)</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-4">
            <div className="w-full">
              <Label htmlFor="digit-length">Number of Digits:</Label>
              <RadioGroup 
                id="digit-length" 
                value={digit_length.toString()} 
                onValueChange={(value) => setDigitLength(parseInt(value) as 4 | 5 | 6)}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="r1" />
                  <Label htmlFor="r1">4 (Easy)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="r2" />
                  <Label htmlFor="r2">5 (Medium)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6" id="r3" />
                  <Label htmlFor="r3">6 (Hard)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Tabs 
              key={`tabs-${sessionId ? 'join' : 'create'}`}
              defaultValue={sessionId ? "join" : "create"} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Game</TabsTrigger>
                <TabsTrigger value="join">Join Game</TabsTrigger>
              </TabsList>
              <TabsContent value="create" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="player-name">Your Name</Label>
                  <Input 
                    id="player-name" 
                    value={playerName} 
                    onChange={(e) => setPlayerName(e.target.value)} 
                    placeholder="Enter your name"
                  />
                </div>
                <Button onClick={createSession} className="w-full">Create New Game</Button>
              </TabsContent>
              <TabsContent value="join" className="space-y-4">
                {sessionId && (
                  <Alert className="bg-blue-50 border-blue-200 text-black">
                    <AlertDescription>
                      You're joining session: <strong>{sessionId}</strong>
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="player-name-join">Your Name</Label>
                  <Input 
                    id="player-name-join" 
                    value={playerName} 
                    onChange={(e) => setPlayerName(e.target.value)} 
                    placeholder="Enter your name"
                    autoFocus={!!sessionId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-id">Session ID</Label>
                  <Input 
                    id="session-id" 
                    value={sessionId} 
                    onChange={(e) => setSessionId(e.target.value.toLowerCase())} 
                    placeholder="Enter session ID" 
                    disabled={!!searchParams.get('session')}
                  />
                </div>
                <Button 
                  onClick={joinSession} 
                  disabled={joiningSession} 
                  className={`w-full ${sessionId ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                >
                  {joiningSession ? "Joining..." : sessionId ? "Join This Session" : "Join Game"}
                </Button>
              </TabsContent>
            </Tabs>
            
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
      ) : (
        gameSession && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <CardTitle className="flex items-center">
                    Game Session: {gameSession.id}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button onClick={copyShareLink} size="sm" variant="outline" className="ml-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            {copied ? "Copied!" : "Share"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy shareable link to invite friends</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {/* Social Media Share Buttons */}
                    <div className="ml-2 flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const shareUrl = `${window.location.origin}/mini-games/cows-and-bulls${gameSession ? `?session=${gameSession.id}` : ''}`;
                                window.open(`https://twitter.com/intent/tweet?text=Join my Cows and Bulls game!&url=${encodeURIComponent(shareUrl)}`, '_blank');
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                              </svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share on Twitter</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const shareUrl = `${window.location.origin}/mini-games/cows-and-bulls${gameSession ? `?session=${gameSession.id}` : ''}`;
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                              </svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share on Facebook</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardTitle>
                  <Button variant="outline" onClick={exitGame}>Exit Game</Button>
                </div>
                <div className="mt-2">
                  <input 
                    type="text" 
                    ref={shareLinkRef}
                    value={window.location.href}
                    className="w-full p-2 border rounded-md text-sm opacity-0 h-0 absolute"
                    readOnly
                  />
                </div>
                <CardDescription>
                  {gameSession.winner 
                    ? `🎉 ${getWinnerName()} won the game! 🎉` 
                    : gameSession.game_started 
                      ? `${getCurrentPlayerName()}'s turn to guess` 
                      : "Waiting for players to get ready"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gameSession.winner ? (
                  <div className="text-center py-8">
                    <h3 className="text-2xl font-bold mb-4">
                      🎉 {getWinnerName()} guessed the number: {gameSession.secret_number} 🎉
                    </h3>
                    <p className="mb-4">Congratulations!</p>
                    <Button onClick={resetGame} className="mr-2">Play Again</Button>
                    <Button variant="outline" onClick={exitGame}>Exit Game</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between mb-6 flex-wrap gap-4">
                      <div>
                        <p className="text-sm font-medium">Current Game:</p>
                        <p>Guess a {gameSession.digit_length}-digit number</p>
                        
                        {!gameSession.game_started && (
                          <div className="mt-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="ready-status"
                                checked={isPlayerReady}
                                onCheckedChange={toggleReady}
                              />
                              <Label htmlFor="ready-status">
                                {isPlayerReady ? "Ready to play!" : "Click when ready"}
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getActivePlayerCount() < 2 
                                ? "Waiting for more players to join..." 
                                : areAllPlayersReady() 
                                  ? "All players ready! Starting game..." 
                                  : "Waiting for all players to be ready..."}
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Players ({getActivePlayerCount()} active / {gameSession.players.length} total):
                        </p>
                        <div className="flex flex-wrap space-x-2 mt-1">
                          {gameSession.players.map((player, index) => (
                            <div key={player.id} className="flex flex-col items-center mt-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar 
                                      className={`${gameSession.current_player_index === index && gameSession.game_started ? 'ring-2 ring-primary animate-pulse' : ''} 
                                        ${player.active === false ? 'opacity-40' : ''}`}
                                    >
                                      <AvatarFallback className={`${player.id === currentPlayerId ? 'bg-primary text-primary-foreground' : ''}`}>
                                        {player.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{player.name} {player.id === currentPlayerId ? "(You)" : ""}
                                      {player.active === false && <span className="ml-1 text-red-500">(Offline)</span>}
                                    </p>
                                    {!gameSession.game_started && (
                                      <p className="text-xs">
                                        {player.ready ? "Ready ✓" : "Not Ready"}
                                      </p>
                                    )}
                                    {gameSession.game_started && gameSession.current_player_index === index && (
                                      <p className="text-xs text-primary font-bold">Current Turn</p>
                                    )}
                                    {!gameSession.game_started && !player.ready && player.id !== currentPlayerId && (
                                      <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        className="mt-1 w-full text-xs"
                                        onClick={() => removePlayer(player.id)}
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge 
                                  variant={player.ready ? "default" : "outline"} 
                                  className={`text-xs ${player.active === false ? 'opacity-40' : ''}`}
                                >
                                  {gameSession.game_started ? `${player.guesses.length} guesses` : player.ready ? "Ready" : "Waiting"}
                                </Badge>
                                {!gameSession.game_started && !player.ready && player.id !== currentPlayerId && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    onClick={() => removePlayer(player.id)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M18 6 6 18"></path>
                                      <path d="m6 6 12 12"></path>
                                    </svg>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {gameSession.game_started ? (
                      isMyTurn() ? (
                        <div className="space-y-4">
                          <Alert variant="default" className="bg-primary/10 border-primary/20">
                            <AlertDescription>
                              <strong>It's your turn!</strong> Make your guess.
                            </AlertDescription>
                          </Alert>
                          <Label htmlFor="current-guess">Your Guess ({gameSession.digit_length} digits, no repeats)</Label>
                          <div className="flex space-x-2">
                            <Input 
                              id="current-guess" 
                              value={currentGuess} 
                              onChange={(e) => setCurrentGuess(e.target.value)} 
                              placeholder={`Enter ${gameSession.digit_length} digits`}
                              maxLength={gameSession.digit_length}
                            />
                            <Button onClick={submitGuess}>Submit</Button>
                          </div>
                          {error && (
                            <Alert variant="destructive">
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          )}
                          <div className="flex gap-4 text-sm mt-2">
                            <div className="flex items-center">
                              <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span> 
                              <span>Bull (correct position)</span>
                            </div>
                            <div className="flex items-center">
                              <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-2"></span> 
                              <span>Cow (wrong position)</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-center">Waiting for <strong>{getCurrentPlayerName()}</strong> to make a guess...</p>
                        </div>
                      )
                    ) : (
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-center">Waiting for all players to be ready before starting the game.</p>
                        <div className="w-full bg-secondary h-2 rounded-full mt-4">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${gameSession.players.filter(p => p.ready).length / gameSession.players.length * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-center text-sm mt-2">
                          {gameSession.players.filter(p => p.ready).length} of {gameSession.players.length} players ready
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter>
                <div className="w-full">
                  <h3 className="font-semibold mb-4">Game History:</h3>
                  <div className="space-y-4">
                    {gameSession.players.map((player) => (
                      <div key={player.id} className={`border rounded-md p-4 ${gameSession.game_started && gameSession.current_player_index === gameSession.players.findIndex(p => p.id === player.id) ? 'border-primary bg-primary/5' : ''}`}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarFallback 
                                className={player.id === currentPlayerId ? 'bg-primary text-primary-foreground' : ''}
                              >
                                {player.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">
                                {player.name} {player.id === currentPlayerId ? "(You)" : ""}
                              </span>
                              {gameSession.game_started && gameSession.current_player_index === gameSession.players.findIndex(p => p.id === player.id) && !gameSession.winner && (
                                <Badge className="ml-2 bg-primary">Current Turn</Badge>
                              )}
                              {gameSession.winner === player.id && (
                                <Badge className="ml-2 bg-green-500">Winner!</Badge>
                              )}
                            </div>
                          </div>
                          <Badge variant={player.id === currentPlayerId ? "default" : "outline"}>
                            {gameSession.game_started ? `${player.guesses.length} guesses` : player.ready ? "Ready" : "Waiting"}
                          </Badge>
                        </div>
                        {player.guesses.length > 0 ? (
                          <div className="space-y-2 mt-2">
                            {player.guesses.map((guess, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                                <div className="w-1/2">
                                  {player.id === currentPlayerId ? (
                                    <span>
                                      Guess #{idx + 1}: <strong>
                                        {Array.from(guess.guess).map((digit, digitIndex) => {
                                          // Determine if this digit is a bull (right position)
                                          const isBull = gameSession.secret_number[digitIndex] === digit;
                                          // Determine if this digit is a cow (right digit, wrong position)
                                          const isCow = !isBull && gameSession.secret_number.includes(digit);
                                          
                                          return (
                                            <span 
                                              key={digitIndex} 
                                              className={`${isBull ? 'text-red-600 font-bold' : isCow ? 'text-blue-600 font-bold' : ''}`}
                                            >
                                              {digit}
                                            </span>
                                          );
                                        })}
                                      </strong>
                                    </span>
                                  ) : (
                                    <span>Guess #{idx + 1}: <em>(hidden)</em></span>
                                  )}
                                </div>
                                <div className="w-1/2 flex space-x-2 justify-end">
                                  <Badge variant="outline" className="bg-red-50 text-red-800">
                                    {guess.bulls} 🐂 Bull{guess.bulls !== 1 ? 's' : ''}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                                    {guess.cows} 🐄 Cow{guess.cows !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No guesses yet</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        )
      )}
    </div>
  );
}