"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const SPRITE_CONFIG = {
  frameWidth: 512,
  frameHeight: 500,
  cols: 8,
  rows: 32,
  totalFrames: 256,
  targetFrame: 252,
  targetFPS: 45,
  spritesLandingHeads: [
    "https://images.dahood.vip/peak_heads_land_heads.png",
    "https://images.dahood.vip/peak_tails_land_heads.png",
  ],
  spritesLandingTails: [
    "https://images.dahood.vip/peak_heads_land_tails.png",
    "https://images.dahood.vip/peak_tails_land_tails.png",
  ],
} as const;

interface FramePosition {
  x: number;
  y: number;
}

export default function CoinFlip() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSprite, setCurrentSprite] = useState("");
  const [bgPosition, setBgPosition] = useState("0px 0px");
  const [framePositions, setFramePositions] = useState<FramePosition[]>([]);
  const [player1Choice, setPlayer1Choice] = useState<"heads" | "tails">("heads");
  const [player2Choice, setPlayer2Choice] = useState<"tails" | "heads">("tails");
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const currentFlipChoicesRef = useRef<{ p1: "heads" | "tails", p2: "heads" | "tails" }>({ p1: "heads", p2: "tails" });
  const initializedRef = useRef(false);

  const calculateFramePositions = useCallback(() => {
    const positions: FramePosition[] = [];
    for (let frame = 0; frame < SPRITE_CONFIG.totalFrames; frame++) {
      const col = frame % SPRITE_CONFIG.cols;
      const row = Math.floor(frame / SPRITE_CONFIG.cols);
      positions.push({
        x: -(col * SPRITE_CONFIG.frameWidth),
        y: -(row * SPRITE_CONFIG.frameHeight),
      });
    }
    return positions;
  }, []);

  const loadRandomSprite = useCallback(() => {
    const allSprites = [...SPRITE_CONFIG.spritesLandingHeads, ...SPRITE_CONFIG.spritesLandingTails];
    const randomIndex = Math.floor(Math.random() * allSprites.length);
    setCurrentSprite(allSprites[randomIndex]);
    return allSprites[randomIndex];
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      setFramePositions(calculateFramePositions());
      loadRandomSprite();
      initializedRef.current = true;
    }
  }, [calculateFramePositions, loadRandomSprite]);

  const finishAnimation = useCallback((sprite: string) => {
    setIsAnimating(false);
    if (framePositions[SPRITE_CONFIG.targetFrame]) {
      const pos = framePositions[SPRITE_CONFIG.targetFrame];
      setBgPosition(`${pos.x}px ${pos.y}px`);
    }
    
    const isHeads = SPRITE_CONFIG.spritesLandingHeads.some(s => sprite === s);
    const result = isHeads ? "heads" : "tails";
    
    if (currentFlipChoicesRef.current.p1 === result) {
      setWinner(1);
    } else if (currentFlipChoicesRef.current.p2 === result) {
      setWinner(2);
    }
  }, [framePositions]);

  const flipCoin = useCallback(() => {
    if (isAnimating || framePositions.length === 0) return;
    
    setIsAnimating(true);
    setWinner(null);
    
    const p1 = Math.random() < 0.5 ? "heads" : "tails";
    const p2 = p1 === "heads" ? "tails" : "heads";
    setPlayer1Choice(p1);
    setPlayer2Choice(p2);
    currentFlipChoicesRef.current = { p1, p2 };
    
    const chosenSprite = loadRandomSprite();

    const startTime = performance.now();
    const totalAnimationTime = (SPRITE_CONFIG.targetFrame / SPRITE_CONFIG.targetFPS) * 1000;
    let lastFrameIndex = -1;

    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalAnimationTime, 1);
      const frameIndex = Math.floor(progress * SPRITE_CONFIG.targetFrame);

      if (frameIndex !== lastFrameIndex && frameIndex < framePositions.length) {
        const pos = framePositions[frameIndex];
        setBgPosition(`${pos.x}px ${pos.y}px`);
        lastFrameIndex = frameIndex;
      }

      if (progress < 1) {
        animationIdRef.current = requestAnimationFrame(animateFrame);
      } else {
        finishAnimation(chosenSprite);
      }
    };

    animationIdRef.current = requestAnimationFrame(animateFrame);
  }, [isAnimating, framePositions, loadRandomSprite, finishAnimation]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isAnimating) {
        e.preventDefault();
        flipCoin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isAnimating, flipCoin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-sans">
        <Card className="relative overflow-visible backdrop-blur-sm shadow-2xl border-2">
        <div className="p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between px-4">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar className={`h-40 w-40 transition-all duration-300 ${winner === 1 ? 'ring-4 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`}>
                    <AvatarFallback className="text-6xl font-black">?</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-12 w-12 absolute -bottom-2 -left-2 border-4 border-card">
                    <AvatarImage src={player1Choice === "heads" ? "https://images.dahood.vip/heads.png" : "https://images.dahood.vip/tails.png"} />
                  </Avatar>
                </div>
                <p className="text-sm text-muted-foreground font-sans font-semibold">ThisUsernameIs20Char</p>
              </div>
              
              <div className="flex flex-col items-center gap-6 mx-16 relative z-10">
                <div className="relative" style={{ width: "600px", height: "200px" }}>
                  <div
                    className="absolute -top-42 left-1/2 -translate-x-1/2"
                    style={{
                      width: "512px",
                      height: "500px",
                      backgroundImage: `url('${currentSprite}')`,
                      backgroundPosition: bgPosition,
                      backgroundSize: "4096px 16000px",
                      backgroundRepeat: "no-repeat",
                      willChange: "background-position",
                      imageRendering: "pixelated",
                    }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar className={`h-40 w-40 transition-all duration-300 ${winner === 2 ? 'ring-4 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`}>
                    <AvatarFallback className="text-6xl font-black">?</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-12 w-12 absolute -bottom-2 -left-2 border-4 border-card">
                    <AvatarImage src={player2Choice === "heads" ? "https://images.dahood.vip/heads.png" : "https://images.dahood.vip/tails.png"} />
                  </Avatar>
                </div>
                <p className="text-sm text-muted-foreground font-sans font-semibold">ThisUsernameIs20Char</p>
              </div>
            </div>
            
            <div className="flex gap-5 px-5">
              <div className="flex-1 h-12 bg-border/50 rounded-md flex items-center justify-between px-4">
                <span className="text-sm font-bold text-white" aria-label="value">R$ 67.41M+</span>
                <span className="text-sm font-bold text-muted-foreground" aria-label="percentage">41.67%</span>
              </div>
              <div className="flex-1 h-12 bg-border/50 rounded-md flex items-center justify-between px-4">
                <span className="text-sm font-bold text-white" aria-label="value">R$ 67.41M+</span>
                <span className="text-sm font-bold text-muted-foreground" aria-label="percentage">41.67%</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-5 px-5">
            <div className="flex-1 h-80 flex flex-col gap-4">
              <div className="h-12 bg-border/30 rounded-md flex items-center justify-between px-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://media1.tenor.com/m/8J50sfeJ3jwAAAAd/sunooburger.gif" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold flex-1 mx-2 truncate text-center">VeryVeryLongTextLmaooo</span>
                <span className="text-sm font-semibold text-green-400">R$ 6,741</span>
              </div>
              <div className="h-12 bg-border/30 rounded-md flex items-center justify-between px-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://media1.tenor.com/m/8J50sfeJ3jwAAAAd/sunooburger.gif" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold flex-1 mx-2 truncate text-center">VeryVeryLongTextLmaooo</span>
                <span className="text-sm font-semibold text-green-400">R$ 6,741</span>
              </div>
              <div className="h-12 bg-border/30 rounded-md flex items-center justify-between px-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://media1.tenor.com/m/8J50sfeJ3jwAAAAd/sunooburger.gif" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold flex-1 mx-2 truncate text-center">VeryVeryLongTextLmaooo</span>
                <span className="text-sm font-semibold text-green-400">R$ 6,741</span>
              </div>
              <div className="h-12 bg-border/30 rounded-md flex items-center justify-between px-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://media1.tenor.com/m/8J50sfeJ3jwAAAAd/sunooburger.gif" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold flex-1 mx-2 truncate text-center">VeryVeryLongTextLmaooo</span>
                <span className="text-sm font-semibold text-green-400">R$ 6,741</span>
              </div>
            </div>
            <div className="flex-1 h-80 flex flex-col gap-4">
              <div className="h-12 bg-border/30 rounded-md flex items-center justify-between px-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://media1.tenor.com/m/8J50sfeJ3jwAAAAd/sunooburger.gif" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold flex-1 mx-2 truncate text-center">VeryVeryLongTextLmaooo</span>
                <span className="text-sm font-semibold text-green-400">R$ 6,741</span>
              </div>
              <div className="h-12 bg-border/30 rounded-md flex items-center justify-between px-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://media1.tenor.com/m/8J50sfeJ3jwAAAAd/sunooburger.gif" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold flex-1 mx-2 truncate text-center">VeryVeryLongTextLmaooo</span>
                <span className="text-sm font-semibold text-green-400">R$ 6,741</span>
              </div>
              <div className="h-12 bg-border/30 rounded-md flex items-center justify-between px-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://media1.tenor.com/m/8J50sfeJ3jwAAAAd/sunooburger.gif" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold flex-1 mx-2 truncate text-center">VeryVeryLongTextLmaooo</span>
                <span className="text-sm font-semibold text-green-400">R$ 6,741</span>
              </div>
              <div className="h-12 bg-border/30 rounded-md flex items-center justify-between px-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://media1.tenor.com/m/8J50sfeJ3jwAAAAd/sunooburger.gif" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold flex-1 mx-2 truncate text-center">VeryVeryLongTextLmaooo</span>
                <span className="text-sm font-semibold text-green-400">R$ 6,741</span>
              </div>
            </div>
          </div>
          
          <div className="mx-4 h-[2px] bg-border"></div>
        </div>
      </Card>
    </div>
  );
}
