/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

type FocusZone = 'menu' | 'cat' | 'content' | 'list' | 'detail';

type FocusContextType = {
  activeZone: FocusZone;
  setActiveZone: (zone: FocusZone) => void;
};

const FocusContext = createContext<FocusContextType>({} as FocusContextType);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [activeZone, setActiveZone] = useState<FocusZone>('menu');

  return (
    <FocusContext.Provider value={{ activeZone, setActiveZone }}>{children}</FocusContext.Provider>
  );
}

export const useFocusZone = () => useContext(FocusContext);
