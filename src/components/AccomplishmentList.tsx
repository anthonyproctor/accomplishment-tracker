'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { trackAccomplishmentAction } from '../lib/analytics'
import toast from 'react-hot-toast'
import SearchAccomplishments from './SearchAccomplishments'
import ExportAccomplishments from './ExportAccomplishments'

interface Accomplishment {
  id: string
  title: string
  description: string
  date: string
  created_at: string
  user_id: string
}

const ITEMS_PER_PAGE = 5

export default function AccomplishmentList() {
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Filter accomplishments based on search query
  const filteredAccomplishments = useMemo(() => {
    if (!searchQuery) return accomplishments

    const query = searchQuery.toLowerCase()
    return accomplishments.filter(acc => 
      acc.title.toLowerCase().includes(query) ||
      acc.description.toLowerCase().includes(query) ||
      new Date(acc.date).toLocaleDateString().toLowerCase().includes(query)
    )
  }, [accomplishments, searchQuery])

  const totalPages = Math.ceil(filteredAccomplishments.length / ITEMS_PER_PAGE)
  const paginatedAccomplishments = filteredAccomplishments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const fetchAccomplishments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data, error } = await supabase
        .from('accomplishments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error

      console.log('Fetched accomplishments:', data) // Debug log
      setAccomplishments(data || [])
    } catch (error) {
      console.error('Error fetching accomplishments:', error)
      toast.error('Failed to load accomplishments')
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

    const accomplishment = accomplishments.find(acc => acc.id === id)
    const toastId = toast.loading('Deleting accomplishment...')

    try {
      setDeleting(id)
      const { error } = await supabase
        .from('accomplishments')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Track deletion
      trackAccomplishmentAction('delete', accomplishment?.title)
      
      // Update the local state to remove the deleted accomplishment
      setAccomplishments(prev => prev.filter(acc => acc.id !== id))
      
      toast.success('Accomplishment deleted successfully', { id: toastId })
    } catch (error) {
      console.error('Error deleting accomplishment:', error)
      toast.error('Failed to delete accomplishment', { id: toastId })
    } finally {
      setDeleting(null)
      setDeleteConfirm(null)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return

    console.log('Setting up real-time subscription for user:', userId) // Debug log

    const subscription = supabase
      .channel('accomplishments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accomplishments',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Received real-time update:', payload) // Debug log
          fetchAccomplishments()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, fetchAccomplishments, supabase])

  // Initial fetch
  useEffect(() => {
    fetchAccomplishments()
  }, [fetchAccomplishments])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <SearchAccomplishments onSearch={setSearchQuery} />
        {accomplishments.length > 0 && (
          <div className="ml-4">
            <ExportAccomplishments 
              accomplishments={accomplishments}
              onExport={() => {
                trackAccomplishmentAction('export', `${accomplishments.length} items`)
                toast.success('Accomplishments exported successfully')
              }}
            />
          </div>
        )}
      </div>
      
      {filteredAccomplishments.length === 0 ? (
        <p className="text-gray-500 text-center">
          {searchQuery 
            ? 'No accomplishments found matching your search.'
            : 'No accomplishments yet. Add your first one!'}
        </p>
      ) : (
        <>
          {paginatedAccomplishments.map((accomplishment) => (
            <div
              key={accomplishment.id}
              className="bg-gray-50 p-4 rounded-lg relative hover:shadow-md transition-shadow"
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
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
