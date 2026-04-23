/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

type DetailsContextType = {
  isDetail: boolean;
  setIsDetail: (params: boolean) => void;
};

const DetailContext = createContext<DetailsContextType>({} as DetailsContextType);

export function DetailProvider({ children }: { children: React.ReactNode }) {
  const [isDetail, setIsDetail] = useState<boolean>(false);

  return (
    <DetailContext.Provider value={{ isDetail, setIsDetail }}>{children}</DetailContext.Provider>
  );
}

export const useDetailContext = () => useContext(DetailContext);
