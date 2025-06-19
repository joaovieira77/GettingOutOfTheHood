"use client";

import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";
import { cn } from "@/lib/utils";
import Image from "next/image"; 
 import { useRouter } from "next/navigation";
import Link from "next/link";


const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveHeight,
  waveWidth,
  waveLength,
  backgroundFill,
  blur = 2,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveHeight?: number;
  waveWidth?: number;
  waveLength?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSafari, setIsSafari] = useState(false);
  let ctx: CanvasRenderingContext2D | null = null;
  let animationId: number;
  let nt = 0;
  let w = 0;
  let h = 0;

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  const waveColors = colors ?? [
    "#780251",
    "#CD1A92",
    "#620BDC",
    "#460B37",
    "#6EAEE8",
  ];

  const drawWave = (n: number) => {
    nt += getSpeed();
    if (!ctx) return;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 150;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      for (let x = 0; x < w; x += 1) {
        const y =
          noise(x / (waveLength || 800), 0.3 * i, nt) * (waveHeight || 250);
        ctx.lineTo(x, y + h / 2);
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  const render = () => {
    if (!ctx) return;
    ctx.fillStyle = backgroundFill || "#261633";
    ctx.globalAlpha = waveOpacity;
    ctx.fillRect(0, 0, w, h);
    drawWave(5);
    animationId = requestAnimationFrame(render);
  };

  const init = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        ctx.scale(dpr, dpr); // Scale to match dpr
        ctx.filter = `blur(${blur}px)`;
      }

      w = width;
      h = height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    render();
  };

  useEffect(() => {
    init();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", () => {});
    };
  }, []);

  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 w-full h-full flex flex-col items-center justify-end",
        containerClassName
      )}
    >
         <div className="absolute top-4 left-4 z-20">
      <Image src="/Spotify.png" alt="Logo" width={48} height={48} />
    </div>
      <canvas
        className="absolute inset-0 z-0 w-full h-full"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
          width: "100vw",
          height: "100vh",
          display: "block",
        }}
      ></canvas>
      <div className={cn("relative z-10 mb-8", className)} {...props}>
        {children}
      </div>
    </div>
  );
};

export default function Home() {





  const router = useRouter();

  return (
    <WavyBackground waveHeight={200} waveWidth={100} waveLength={1000}>
      <h1 className="text-4xl font-bold text-white mb-2 text-center">
        Hello,
      </h1>
      <p className="text-2xl text-white mb-10 text-center">
        Welcome to Spotidados
      </p>
      <div className="w-full flex justify-center">
        <Link href="/homepage" className="w-auto">
          <button
            className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            type="button"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              Get Started
            </span>
          </button>
        </Link>
      </div>
    </WavyBackground>
  );
}