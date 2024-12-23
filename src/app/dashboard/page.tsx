'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import AccomplishmentList from '../../components/AccomplishmentList'

interface NewAccomplishment {
  title: string
  description: string
  date: string
}

export default function DashboardPage() {
  const [newAccomplishment, setNewAccomplishment] = useState<NewAccomplishment>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('accomplishments')
        .insert([
          {
            ...newAccomplishment,
            user_id: user.id
          }
        ])

      if (error) throw error

      setNewAccomplishment({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      
      // Trigger a refresh of the accomplishments list
      router.refresh()
    } catch (error) {
      console.error('Error adding accomplishment:', error)
      alert('Failed to add accomplishment')
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Accomplishment Tracker
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Add New Accomplishment Form */}
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Add New Accomplishment
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newAccomplishment.title}
                  onChange={(e) => setNewAccomplishment(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newAccomplishment.description}
                  onChange={(e) => setNewAccomplishment(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={newAccomplishment.date}
                  onChange={(e) => setNewAccomplishment(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Accomplishment
              </button>
            </form>
          </div>

          {/* List of Accomplishments */}
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Your Accomplishments
            </h2>
            <AccomplishmentList />
          </div>
        </div>
      </main>
    </div>
  )
}
