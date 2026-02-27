"use client";
import GestureStream from '@/app/gesturestream'; // adjust path if needed

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-4 min-h-screen p-8 bg-slate-50">
      <h1 className='text-2xl font-bold text-slate-800'>
        selrvk.dev
      </h1>
      <GestureStream />
    </div>
  );
}