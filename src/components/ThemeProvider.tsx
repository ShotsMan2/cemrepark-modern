"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import React, { useState, useEffect } from "react";

export default function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
