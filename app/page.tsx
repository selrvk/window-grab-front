"use client";
import GestureStream from '@/app/gesturestream'; // adjust path if needed

export default function Home() {
  return (
    <div className="flex flex-col text-center items-center gap-4 min-h-screen pt-2 bg-linear-to-t from-[#0d0a1c] to-[#17091c]">
      <div>
        <h1 className='text-xl font-bold text-amber-50'>
          https://selrvk.dev
        </h1>
        <h4 className='text-xs text-amber-300/80'>
          meta glasses, mediapipe, nextjs
        </h4>
      </div>
      <GestureStream />
    </div>
  );
}