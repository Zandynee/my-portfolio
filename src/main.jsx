import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import "tailwindcss";
import './index.css'
import App from './App.jsx'
import RealApp from './components/RealApp.jsx'
import MainPage from './MainPage.jsx';

// Define your routes here
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage/>, // Your existing App becomes the home page
  },
  {
    path: "/side-projects",
    element: <RealApp />, // The new path you just created
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
  
    <RouterProvider router={router} />
  </StrictMode>,
)