'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

interface Accomplishment {
  id: string
  title: string
  description: string
  date: string
  created_at: string
}

export default function AccomplishmentList() {
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchAccomplishments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('accomplishments')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setAccomplishments(data || [])
    } catch (error) {
      console.error('Error fetching accomplishments:', error)
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      // Auto-dismiss confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000)
      return
    }

    try {
      setDeleting(id)
      const { error } = await supabase
        .from('accomplishments')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Update the local state to remove the deleted accomplishment
      setAccomplishments(prev => prev.filter(acc => acc.id !== id))
    } catch (error) {
      console.error('Error deleting accomplishment:', error)
      alert('Failed to delete accomplishment')
    } finally {
      setDeleting(null)
      setDeleteConfirm(null)
    }
  }

  useEffect(() => {
    fetchAccomplishments()
  }, [fetchAccomplishments])

  if (loading) {
    return <div className="flex justify-center items-center">Loading...</div>
  }

  return (
    <div className="space-y-4">
      {accomplishments.length === 0 ? (
        <p className="text-gray-500 text-center">No accomplishments yet. Add your first one!</p>
      ) : (
        accomplishments.map((accomplishment) => (
          <div
            key={accomplishment.id}
            className="bg-gray-50 p-4 rounded-lg relative"
          >
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-gray-900">
                  {accomplishment.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(accomplishment.date).toLocaleDateString()}
                </p>
                <p className="mt-2 text-gray-700">
                  {accomplishment.description}
                </p>
              </div>
              <button
                onClick={() => handleDelete(accomplishment.id)}
                disabled={deleting === accomplishment.id}
                className={`ml-4 flex-shrink-0 ${
                  deleteConfirm === accomplishment.id
                    ? 'bg-red-100 text-red-800 px-3 py-1 rounded'
                    : 'text-red-600 hover:text-red-800'
                }`}
                title={deleteConfirm === accomplishment.id ? 'Click again to confirm deletion' : 'Delete accomplishment'}
              >
                {deleting === accomplishment.id ? (
                  <span className="text-sm">Deleting...</span>
                ) : deleteConfirm === accomplishment.id ? (
                  <span className="text-sm">Click to confirm</span>
                ) : (
                  <span className="text-sm">Delete</span>
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
