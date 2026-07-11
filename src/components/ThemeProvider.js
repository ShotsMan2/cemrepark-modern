"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState, useEffect } from "react";

export default function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
