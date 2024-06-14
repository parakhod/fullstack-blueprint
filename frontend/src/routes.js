import React from "react";
import { Navigate } from "react-router-dom";

import {
  Home,
  Test
} from './pages'

export const routes = [
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/test",
    element: <Test />
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]
