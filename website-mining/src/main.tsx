import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import CatalogIndex from './pages/CatalogIndex'
import Category from './pages/Category'
import Product from './pages/Product'
import EquipmentLine from './pages/EquipmentLine'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/catalog', element: <CatalogIndex /> },
      { path: '/catalog/:categoryId', element: <Category /> },
      { path: '/catalog/:categoryId/:itemId', element: <Product /> },
      { path: '/equipment/:lineId', element: <EquipmentLine /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
