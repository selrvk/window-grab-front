"use client";
import { useEffect, useRef } from 'react';

export default function GestureStream() {
  const videoRef = useRef(null);
  const pcRef = useRef(null);

  const startStream = async () => {
    // 1. Create Peer Connection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    // 2. Handle incoming stream
    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    // 3. Set up the offer (tell the backend we want video)
    pc.addTransceiver("video", { direction: "recvonly" });
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // 4. Send offer to Python Backend
    const response = await fetch("http://YOUR_PYTHON_IP:8080/offer", {
      method: "POST",
      body: JSON.stringify({
        sdp: pc.localDescription.sdp,
        type: pc.localDescription.type,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const answer = await response.json();
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  };

  useEffect(() => {
    return () => {
      if (pcRef.current) pcRef.current.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-lg border-2 border-slate-800 w-full max-w-2xl shadow-xl"
      />
      <button 
        onClick={startStream}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Connect Gesture Stream
      </button>
    </div>
  );
}