"use client";

import { createContext, useContext } from "react";

export const CVReadOnlyContext = createContext<boolean>(false);

export const useCVReadOnly = () => useContext(CVReadOnlyContext);
