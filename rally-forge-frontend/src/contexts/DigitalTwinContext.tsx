import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Location {
  zipCode?: string;
  city?: string;
  state?: string;
}

interface DigitalTwin {
  location?: Location;
}

interface DigitalTwinContextType {
  digitalTwin: DigitalTwin | null;
  updateDigitalTwin: (twin: Partial<DigitalTwin>) => void;
}

const DigitalTwinContext = createContext<DigitalTwinContextType | undefined>(undefined);

export const DigitalTwinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null);

  const updateDigitalTwin = (twin: Partial<DigitalTwin>) => {
    setDigitalTwin(prev => prev ? { ...prev, ...twin } : twin as DigitalTwin);
  };

  return (
    <DigitalTwinContext.Provider value={{ digitalTwin, updateDigitalTwin }}>
      {children}
    </DigitalTwinContext.Provider>
  );
};

export const useDigitalTwin = () => {
  const context = useContext(DigitalTwinContext);
  if (context === undefined) {
    throw new Error('useDigitalTwin must be used within a DigitalTwinProvider');
  }
  return context;
};
