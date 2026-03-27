"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type SOSFlow = "IDLE" | "CHOOSING" | "SENDING" | "ACTIVE";

interface SOSState {
  flow: SOSFlow;
  setFlow: (f: SOSFlow) => void;
  emerType: string;
  setEmerType: (t: string) => void;
  stepIndex: number;
  setStepIndex: (i: number) => void;
  guardActive: boolean;
  setGuardActive: (b: boolean) => void;
  isFullyReached: boolean;
  setIsFullyReached: (b: boolean) => void;
  countdown: number;
  setCountdown: (c: number | ((prev: number) => number)) => void;
  timerRunning: boolean;
  setTimerRunning: (b: boolean) => void;
  handleReset: () => void;
}

const SOSContext = createContext<SOSState | undefined>(undefined);

import { useAuth } from "@/context/AuthContext";

export function SOSProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [flow, setFlow] = useState<SOSFlow>("IDLE");
  const [emerType, setEmerType] = useState("");
  const [stepIndex, setStepIndex] = useState(-1);
  const [guardActive, setGuardActive] = useState(false);
  const [isFullyReached, setIsFullyReached] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Load state on mount
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`smart-society-sos-state-${user.uid}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFlow(parsed.flow);
        setEmerType(parsed.emerType);
        setStepIndex(parsed.stepIndex);
        setGuardActive(parsed.guardActive);
        setIsFullyReached(parsed.isFullyReached);
        setTimerRunning(parsed.timerRunning);
        
        let initialCountdown = parsed.countdown ?? 60;
        if (parsed.timerRunning && parsed.lastSynced) {
           const elapsed = Math.floor((Date.now() - parsed.lastSynced) / 1000);
           initialCountdown = Math.max(0, initialCountdown - elapsed);
        }
        setCountdown(initialCountdown);
      } catch (e) {}
    } else {
       setFlow("IDLE"); setStepIndex(-1); setCountdown(60); setTimerRunning(false);
    }
  }, [user]);

  // Save state on change
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`smart-society-sos-state-${user.uid}`, JSON.stringify({
      flow, emerType, stepIndex, guardActive, isFullyReached, countdown, timerRunning,
      lastSynced: Date.now()
    }));
  }, [flow, emerType, stepIndex, guardActive, isFullyReached, countdown, timerRunning, user]);

  // Simulation Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (flow === "SENDING") {
      timer = setTimeout(() => {
        setFlow("ACTIVE");
        setStepIndex(0);
      }, 3000);
    } else if (flow === "ACTIVE") {
      if (stepIndex >= 0 && stepIndex < 3) {
        timer = setTimeout(() => {
          const nextIndex = stepIndex + 1;
          setStepIndex(nextIndex);
          if (nextIndex === 2) {
            setGuardActive(true);
          }
          if (nextIndex === 3) {
            setTimerRunning(true);
          }
        }, 2000);
      } else if (stepIndex === 3 && countdown === 0) {
        setStepIndex(4);
        setIsFullyReached(true);
        try {
          const logKey = user ? `smart-society-activity-logs-${user.uid}` : "smart-society-activity-logs";
          const logs = JSON.parse(localStorage.getItem(logKey) || "[]");
          logs.unshift({
            id: Date.now(),
            type: "Emergency Resolved",
            detail: `Security Guard arrived. Emergency is now resolved.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "Completed"
          });
          localStorage.setItem(logKey, JSON.stringify(logs));
        } catch(e) {}
      }
    }
    return () => clearTimeout(timer);
  }, [flow, stepIndex, countdown]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, countdown]);

  const handleReset = () => {
    setFlow("IDLE");
    setEmerType("");
    setStepIndex(-1);
    setGuardActive(false);
    setIsFullyReached(false);
    setCountdown(60);
    setTimerRunning(false);
  };

  return (
    <SOSContext.Provider value={{
      flow, setFlow, 
      emerType, setEmerType, 
      stepIndex, setStepIndex,
      guardActive, setGuardActive,
      isFullyReached, setIsFullyReached,
      countdown, setCountdown,
      timerRunning, setTimerRunning,
      handleReset
    }}>
      {children}
    </SOSContext.Provider>
  );
}

export function useSOS() {
  const context = useContext(SOSContext);
  if (context === undefined) {
    throw new Error("useSOS must be used within an SOSProvider");
  }
  return context;
}
