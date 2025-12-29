// Dashboard Page - Compatible with main UI
// Author: FemtoHell for SMAR-40

import { FileText, History, Package, Settings, Users } from 'lucide-react'
import { useNavigate } from 'react-router'

/**
 * Dashboard landing page after login
 * Shows stats and quick navigation
 */
export function Component() {
  const navigate = useNavigate()

  const quickActions = [
    {
      title: 'Batches',
      description: 'Manage image batches',
      icon: Package,
      path: '/batches',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Users',
      description: 'User management',
      icon: Users,
      path: '/users',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Settings',
      description: 'System settings',
      icon: Settings,
      path: '/settings',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'History',
      description: 'View activity logs',
      icon: History,
      path: '/history',
      color: 'text-orange-600 dark:text-orange-400',
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          SmartPick Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Cashew image processing and management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Batches
          </p>
          <p className="text-3xl font-bold mt-2">24</p>
          <p className="text-xs text-gray-500 mt-2">+3 from last week</p>
        </div>
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Images Processed
          </p>
          <p className="text-3xl font-bold mt-2">1,234</p>
          <p className="text-xs text-gray-500 mt-2">+180 from last week</p>
        </div>
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Accuracy Rate
          </p>
          <p className="text-3xl font-bold mt-2">98.5%</p>
          <p className="text-xs text-gray-500 mt-2">+0.3% from last week</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.path}
              type="button"
              onClick={() => navigate(action.path)}
              className="border rounded-lg p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow text-left"
            >
              <action.icon className={`h-8 w-8 mb-2 ${action.color}`} />
              <h3 className="text-lg font-semibold">{action.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5" />
          System Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Cashew Grades
            </span>
            <span className="font-medium">24 grades supported</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Storage Backend
            </span>
            <span className="font-medium">MinIO Object Storage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Database</span>
            <span className="font-medium">PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  )
}
