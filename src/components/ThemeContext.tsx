/**
 * @format
 */

import React, { createContext, useContext } from 'react';
import { dark, type Palette } from '../theme';

const ThemeContext = createContext<Palette>(dark);

export const ThemeProvider = ({
  palette,
  children,
}: {
  palette: Palette;
  children: React.ReactNode;
}) => (
  <ThemeContext.Provider value={palette}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
