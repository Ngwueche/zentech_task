import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { ProductsListPage } from '@/features/products/pages/ProductsListPage'
import { ProductDetailsPage } from '@/features/products/pages/ProductDetailsPage'
import { CreateProductPage } from '@/features/products/pages/CreateProductPage'
import { EditProductPage } from '@/features/products/pages/EditProductPage'
import { HealthPage } from '@/features/health/pages/HealthPage'
import { ProtectedRoute } from './ProtectedRoute'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'products', element: <ProductsListPage /> },
      { path: 'products/create', element: <CreateProductPage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },
      { path: 'products/:id/edit', element: <EditProductPage /> },
      { path: 'health', element: <HealthPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
