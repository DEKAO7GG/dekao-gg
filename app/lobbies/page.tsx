'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getDocs, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc, collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { useRouter } from 'next/navigation'

type Lobby = {
  id: string
  title: string
  description: string
  type: string
  createdAt: any
  createdBy: {
    name: string
    avatar: string
    uid: string
  }
  participants: {
    uid: string
    name: string
    avatar: string
  }[]
  applicants?: {
    uid: string
    name: string
    avatar: string
  }[]
  roomId?: string
}

export default function LobbiesPage() {
  const [lobbies, setLobbies] = useState<Lobby[]>([])
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'lobbies'), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lobby[]
      setLobbies(fetched)
    })
    return () => unsub()
  }, [])

  const handleApply = async (lobbyId: string) => {
    if (!session?.user) return alert('ログインが必要です')
    const user = {
      uid: (session.user as any).sub || 'unknown-id',
      name: session.user.name || 'NoName',
      avatar: session.user.image || '',
    }
    await updateDoc(doc(db, 'lobbies', lobbyId), {
      applicants: arrayUnion(user),
    })
  }

  const handleApprove = async (lobbyId: string, user: any) => {
    const lobbyRef = doc(db, 'lobbies', lobbyId)
    await updateDoc(lobbyRef, {
      applicants: arrayRemove(user),
      participants: arrayUnion(user),
    })
  }

  const handleReject = async (lobbyId: string, user: any) => {
    await updateDoc(doc(db, 'lobbies', lobbyId), {
      applicants: arrayRemove(user),
    })
  }

  const handleChangeRoomId = async (lobbyId: string) => {
    const newRoomId = prompt('新しいルームIDを入力')
    if (!newRoomId) return
    await updateDoc(doc(db, 'lobbies', lobbyId), {
      roomId: newRoomId,
    })
  }

  const handleLeave = async (lobbyId: string) => {
    if (!session?.user) return alert('ログインが必要です')
    const user = {
      uid: (session.user as any).sub || 'unknown-id',
      name: session.user.name || 'NoName',
      avatar: session.user.image || '',
    }
    await updateDoc(doc(db, 'lobbies', lobbyId), {
      participants: arrayRemove(user),
    })
  }

  const handleDelete = async (lobbyId: string) => {
    const confirmDelete = confirm('本当にこの募集を削除しますか？')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'lobbies', lobbyId))
  }

  const isAdmin = (session?.user as any)?.email === 'levelitisibari@gmail.com'

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ロビー一覧</h1>

      {isAdmin && (
        <button
          className="mb-4 bg-red-700 text-white px-4 py-2 rounded"
          onClick={async () => {
            const confirmReset = confirm('全募集を削除しますか？')
            if (!confirmReset) return
            const snapshot = await getDocs(collection(db, 'lobbies'))
            snapshot.forEach((docSnap) => {
              deleteDoc(doc(db, 'lobbies', docSnap.id))
            })
          }}
        >
          全リセット（管理者）
        </button>
      )}

      {lobbies.length === 0 ? (
        <p>現在募集中のロビーはありません</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {lobbies.map((lobby) => {
            const uid = (session?.user as any)?.sub || 'unknown-id'
            const isJoined = lobby.participants.some((p) => p.uid === uid)
            const isOwner = lobby.createdBy.uid === uid
            const isApplicant = lobby.applicants?.some((a) => a.uid === uid)

            return (
              <li key={lobby.id} className="border p-4 rounded">
                <h2 className="font-bold text-lg">{lobby.title}</h2>
                <p className="text-sm text-gray-600">{lobby.description}</p>
                <p className="text-sm text-blue-600">{lobby.type}</p>
                <div className="text-sm mt-2 text-gray-700">
                  {lobby.participants.length} / {lobby.type === 'rank' ? 2 : '∞'}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <img src={lobby.createdBy.avatar} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-sm">{lobby.createdBy.name}</span>
                </div>

                {lobby.participants.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    {lobby.participants.map((p) => (
                      <div key={p.uid} className="flex items-center gap-1 border px-2 py-1 rounded bg-gray-100">
                        <img src={p.avatar} alt="" className="w-5 h-5 rounded-full" />
                        <span className="text-sm">{p.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {isOwner && (
                  <>
                    {(lobby.applicants?.length ?? 0) > 0 && (
  <div className="mt-2">
    <p className="text-sm font-bold">申請中:</p>
    <div className="flex flex-wrap gap-2">
      {lobby.applicants?.map((a) => (
        <div key={a.uid} className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
          <img src={a.avatar} className="w-5 h-5 rounded-full" />
          <span className="text-sm">{a.name}</span>
          <button className="text-green-600" onClick={() => handleApprove(lobby.id, a)}>承認</button>
          <button className="text-red-600" onClick={() => handleReject(lobby.id, a)}>却下</button>
        </div>
      ))}
    </div>
  </div>
)}

                    <button className="mt-2 bg-blue-600 text-white px-2 py-1 rounded" onClick={() => handleChangeRoomId(lobby.id)}>ルームID変更</button>
                    {lobby.roomId && <p className="mt-1 text-sm text-gray-800">現在のルームID: {lobby.roomId}</p>}
                    <button className="mt-2 bg-black text-white px-3 py-1 rounded" onClick={() => handleDelete(lobby.id)}>募集削除</button>
                  </>
                )}

                {!isOwner && session?.user && (
                  isJoined ? (
                    <button className="mt-2 bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleLeave(lobby.id)}>離脱</button>
                  ) : isApplicant ? (
                    <span className="mt-2 inline-block text-yellow-600">申請中</span>
                  ) : (
                    <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded" onClick={() => handleApply(lobby.id)}>参加申請</button>
                  )
                )}

                {!isOwner && isJoined && lobby.roomId && (
                  <p className="mt-2 text-sm text-green-700">ルームID: {lobby.roomId}</p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
