"use client";
import { useEffect, useRef, useState } from 'react';

export default function GestureStream() {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const startStream = async () => {
    console.log("Starting stream...");
    
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    pc.oniceconnectionstatechange = () => console.log("ICE state:", pc.iceConnectionState);
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") setConnected(true);
      if (pc.connectionState === "failed" || pc.connectionState === "closed") setConnected(false);
    };
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

    await new Promise((resolve) => {
      if (pc.iceGatheringState === "complete") return resolve();
      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") resolve();
      };
    });

    console.log("Sending offer to server...");
    try {
      {/* fam change this to the ip of the host running the backend*/}
      const response = await fetch("http://192.168.1.2:8080/offer", {
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
      setConnected(false);
    }
  };

  const stopStream = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setConnected(false);
  };

  useEffect(() => {
    return () => { if (pcRef.current) pcRef.current.close(); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-lg border-2 border-slate-800 w-full max-w-[1000px] shadow-xl shadow-[#714282]/40"
      />
      <button
        onClick={connected ? stopStream : startStream}
        className={`text-sm px-2 py-2 rounded-md text-white transition-colors ${
          connected
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {connected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
}