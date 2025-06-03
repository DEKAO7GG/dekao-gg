'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function DebugPage() {
  const { data: session } = useSession()

  useEffect(() => {
    console.log('🔥 session:', session)
    if (session?.user) {
      console.log('✅ sub:', (session.user as any).sub)
    }
  }, [session])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">確認中…（F12 → Consoleで確認してね）</h1>
    </div>
  )
}
