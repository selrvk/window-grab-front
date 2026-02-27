"use client";
import { useEffect, useRef } from 'react';

export default function GestureStream() {
  const videoRef = useRef(null);
  const pcRef = useRef(null);

  const startStream = async () => {
    console.log("Starting stream...");
    
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    // debug logging
    pc.oniceconnectionstatechange = () => console.log("ICE state:", pc.iceConnectionState);
    pc.onconnectionstatechange = () => console.log("Connection state:", pc.connectionState);
    pc.onicegatheringstatechange = () => console.log("ICE gathering:", pc.iceGatheringState);

    pc.ontrack = (event) => {
      console.log("Got track!", event.streams);
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.addTransceiver("video", { direction: "recvonly" });
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // wait for ICE gathering before sending
    await new Promise((resolve) => {
      if (pc.iceGatheringState === "complete") return resolve();
      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") resolve();
      };
    });

    console.log("Sending offer to server...");
    try {
      const response = await fetch("http://localhost:8080/offer", {
        method: "POST",
        body: JSON.stringify({
          sdp: pc.localDescription.sdp,
          type: pc.localDescription.type,
        }),
        headers: { "Content-Type": "application/json" },
      });
      console.log("Got response:", response.status);
      const answer = await response.json();
      console.log("Setting remote description...");
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("Done - waiting for track...");
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    return () => { if (pcRef.current) pcRef.current.close(); };
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