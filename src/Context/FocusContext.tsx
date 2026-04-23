/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

export type FocusZone = 'menu' | 'cat' | 'content' | 'list' | 'detail' | 'epg';

type FocusContextType = {
  activeZone: FocusZone;
  setActiveZone: (zone: FocusZone) => void;
  isActiveZone: (zone: FocusZone) => boolean;
};

const FocusContext = createContext<FocusContextType>({} as FocusContextType);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [activeZone, setActiveZone] = useState<FocusZone>('menu');
  const isActiveZone = (zone: FocusZone) => activeZone === zone;

  return (
    <FocusContext.Provider value={{ activeZone, setActiveZone, isActiveZone }}>
      {children}
    </FocusContext.Provider>
  );
}

export const useFocusZone = () => useContext(FocusContext);
