const CACHE_REVALIDATION_TIME = 60 // seconds

export async function getAccomplishmentsWithCache(userId: string) {
  // Use Next.js fetch with cache configuration
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/accomplishments?user_id=eq.${userId}&select=*`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    next: {
      revalidate: CACHE_REVALIDATION_TIME,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch accomplishments')
  }

  return response.json()
}

export async function invalidateAccomplishmentsCache() {
  try {
    await fetch('/api/revalidate?path=/dashboard', {
      method: 'POST',
    })
  } catch (error) {
    console.error('Failed to invalidate cache:', error)
  }
}
