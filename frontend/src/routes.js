import React from "react";
import { Navigate } from "react-router-dom";

import {
  Home,
  Transcribe
} from './pages'

export const routes = [
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/transcribe",
    element: <Transcribe />
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]
