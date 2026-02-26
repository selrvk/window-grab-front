"use client";
import { useState } from 'react';

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Replace this with your Python machine's actual IP
  const STREAM_URL = "http://192.168.1.2:5000/video";

  return (
    <div className="flex flex-col items-center gap-4 min-h-screen p-8 bg-slate-50">
      <h1 className='text-2xl font-bold text-slate-800'>
        selrvk.dev
      </h1>

      <div className="relative rounded-lg border-2 border-slate-800 overflow-hidden shadow-xl bg-black">
        {isStreaming ? (
          <img 
            src={STREAM_URL} 
            alt="Gesture Stream"
            className="w-full max-w-5xl h-auto block"
            // Adding a key or a timestamp helps force a refresh if the connection drops
            key={isStreaming ? 'active' : 'inactive'}
          />
        ) : (
          <div className="w-[800px] h-[450px] flex items-center justify-center text-slate-400">
            Stream is offline. Click connect to start.
          </div>
        )}
      </div>

      <button 
        onClick={() => setIsStreaming(!isStreaming)}
        className={`px-6 py-2 rounded-md font-semibold transition-colors ${
          isStreaming 
            ? "bg-red-500 hover:bg-red-600 text-white" 
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isStreaming ? "Disconnect Stream" : "Connect Gesture Stream"}
      </button>
    </div>
  );
}