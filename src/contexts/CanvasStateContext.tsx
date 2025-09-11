import React, { createContext, useContext, useState, useCallback } from "react";
import type { DroppedComponent, Wire } from "~/types/circuit";

// ...existing code removed placeholder...

interface CanvasState {
  components: DroppedComponent[];
  wires: Wire[];
  config: any; // wiring / loaded configuration
}

interface CanvasStateContextValue {
  canvasState: CanvasState;
  setComponents: React.Dispatch<React.SetStateAction<DroppedComponent[]>>;
  setWires: React.Dispatch<React.SetStateAction<Wire[]>>;
  setConfig: (cfg: any) => void;
  addComponent: (c: DroppedComponent) => void;
  updateComponentPosition: (id: string, x: number, y: number) => void;
  ready: boolean;
  setReady: (v: boolean) => void;
}

const CanvasStateContext = createContext<CanvasStateContextValue | undefined>(undefined);

export function CanvasStateProvider({ children }: { children: React.ReactNode }) {
  const [components, setComponentsState] = useState<DroppedComponent[]>([]);
  const [wires, setWiresState] = useState<Wire[]>([]);
  const [config, setConfigState] = useState<any>(null);
  const [ready, setReady] = useState(false);

  const setComponents = useCallback<React.Dispatch<React.SetStateAction<DroppedComponent[]>>>(
    (updater) => setComponentsState(updater as React.SetStateAction<DroppedComponent[]>)
  , []);
  const setWires = useCallback<React.Dispatch<React.SetStateAction<Wire[]>>>(
    (updater) => setWiresState(updater as React.SetStateAction<Wire[]>)
  , []);
  const setConfig = useCallback((cfg: any) => setConfigState(cfg), []);
  const addComponent = useCallback(
    (c: DroppedComponent) => setComponentsState(prev => [...prev, c]),
    []
  );
  const updateComponentPosition = useCallback(
    (id: string, x: number, y: number) =>
      setComponentsState(prev => prev.map(c => (c.id === id ? { ...c, x, y } : c))),
    []
  );
  const setReadyCb = useCallback((v: boolean) => setReady(v), []);

  const value: CanvasStateContextValue = {
    canvasState: { components, wires, config },
    setComponents,
    setWires,
    setConfig,
    addComponent,
    updateComponentPosition,
    ready,
    setReady: setReadyCb,
  };

  return (
    <CanvasStateContext.Provider value={value}>
      {children}
    </CanvasStateContext.Provider>
  );
}

export function useCanvasState() {
  const ctx = useContext(CanvasStateContext);
  if (!ctx) throw new Error("useCanvasState must be used within a CanvasStateProvider");
  return ctx;
}
