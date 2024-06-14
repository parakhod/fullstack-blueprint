import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from './routes'

import './stylesheets/app.scss';

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
