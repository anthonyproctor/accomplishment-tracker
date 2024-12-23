'use client'

import { Suspense, useState } from 'react'
import AddAccomplishment from '../../components/AddAccomplishment'
import AccomplishmentList from '../../components/AccomplishmentList'
import ErrorBoundary from '../../components/ErrorBoundary'

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )
}

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAccomplishmentAdded = () => {
    // Force a refresh of the list
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Track Your Accomplishments
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Keep a record of your professional achievements and milestones.
            </p>
          </div>

          <ErrorBoundary>
            <div className="bg-white shadow rounded-lg p-6">
              <Suspense fallback={<LoadingSpinner />}>
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Add New Accomplishment
                  </h2>
                  <AddAccomplishment onAdd={handleAccomplishmentAdded} />
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Your Accomplishments
                  </h2>
                  <AccomplishmentList key={refreshKey} />
                </div>
              </Suspense>
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
