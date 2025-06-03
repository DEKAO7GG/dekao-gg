'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { db } from '../../firebaseConfig'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'

export default function CreateLobbyPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'rank' | 'custom'>('rank')
  const [canCreate, setCanCreate] = useState(true)

  useEffect(() => {
    const checkLobbyLimit = async () => {
      if (!session?.user) return
      const uid = (session.user as any).sub || 'unknown-id'
      const q = query(collection(db, 'lobbies'), where('createdBy.uid', '==', uid))
      const snapshot = await getDocs(q)
      if (snapshot.size >= 1) setCanCreate(false)
    }
    checkLobbyLimit()
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) return alert('ログインが必要です')
    if (!canCreate) return alert('募集は1つまで作成可能です')

    const uid = (session.user as any).sub || 'unknown-id'
    const name = session.user.name || 'No Name'
    const avatar = session.user.image || ''

    await addDoc(collection(db, 'lobbies'), {
      title,
      description,
      type,
      createdAt: Timestamp.now(),
      createdBy: { uid, name, avatar },
      participants: [],
      applicants: [],
      roomId: '',
    })

    router.push('/lobbies')
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">募集を作成</h1>
      {!canCreate && (
        <p className="text-red-500 mb-2">※募集は1件まで作成可能です。</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="border p-2 rounded"
          placeholder="詳細"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select
          className="border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value as 'rank' | 'custom')}
        >
          <option value="rank">ランク募集</option>
          <option value="custom">カスタム募集</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={!canCreate}
        >
          作成
        </button>
      </form>
    </div>
  )
}
