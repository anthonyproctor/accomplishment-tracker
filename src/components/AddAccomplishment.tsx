'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase'
import { trackAccomplishmentAction } from '../lib/analytics'
import toast from 'react-hot-toast'

export default function AddAccomplishment({ onAdd }: { onAdd: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading('Adding accomplishment...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to add accomplishments', { id: toastId })
        return
      }

      console.log('Adding accomplishment:', { title, description, date, user_id: user.id }) // Debug log

      const { error, data } = await supabase
        .from('accomplishments')
        .insert([
          {
            title,
            description,
            date,
            user_id: user.id,
          },
        ])
        .select()

      if (error) throw error

      console.log('Added accomplishment:', data) // Debug log

      // Track successful creation
      trackAccomplishmentAction('create', title)

      setTitle('')
      setDescription('')
      setDate('')
      onAdd()
      toast.success('Accomplishment added successfully!', { id: toastId })
    } catch (error) {
      console.error('Error adding accomplishment:', error)
      toast.error('Failed to add accomplishment', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Accomplishment'}
      </button>
    </form>
  )
}
