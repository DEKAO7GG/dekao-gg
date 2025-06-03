'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { db } from '../firebaseConfig'
import { getDocs, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc, collection, onSnapshot, getDoc } from 'firebase/firestore'

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
  const { data: session } = useSession()  // セッション情報を取得
  const router = useRouter()

  const isAdmin = session?.user?.email === 'levelitisibari@gmail.com'

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'lobbies'), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lobby[]
      setLobbies(fetched)
    })
    return () => unsub()  // クリーンアップ
  }, [])

  const uid = session?.user?.email || 'unknown-id'  // emailをUIDとして使う

  const handleApply = async (lobbyId: string) => {
    if (!session?.user) return alert('ログインが必要です')

    const user = {
      uid,
      name: session.user.name || 'NoName',
      avatar: session.user.image || '',
    }

    const lobbyRef = doc(db, 'lobbies', lobbyId)
    const lobbySnap = await getDoc(lobbyRef)
    const lobbyData = lobbySnap.data()

    // 既に参加しているか確認
    if (lobbyData?.participants.some((p: any) => p.uid === uid)) {
      return alert('すでに参加しています')
    }

    // 参加申請無しで即参加
    await updateDoc(lobbyRef, {
      participants: arrayUnion(user),
    })
  }

  const handleLeave = async (lobbyId: string) => {
    if (!session?.user) return alert('ログインが必要です')

    const user = {
      uid,
      name: session.user.name || 'NoName',
      avatar: session.user.image || '',
    }

    await updateDoc(doc(db, 'lobbies', lobbyId), {
      participants: arrayRemove(user),
    })
  }

  const handleDelete = async (lobbyId: string) => {
    if (!session?.user) return alert('ログインが必要です')

    const lobbyRef = doc(db, 'lobbies', lobbyId)
    const lobbySnap = await getDoc(lobbyRef)
    const lobbyData = lobbySnap.data()

    if (lobbyData?.createdBy.uid !== uid) {
      return alert('あなたはこのロビーの作成者ではないため削除できません')
    }

    const confirmDelete = confirm('本当にこの募集を削除しますか？')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'lobbies', lobbyId))
  }

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
            const isJoined = lobby.participants.some((p) => p.uid === uid)
            const isOwner = lobby.createdBy.uid === uid

            return (
              <li key={lobby.id} className="border p-4 rounded">
                <h2 className="font-bold text-lg">{lobby.title}</h2>
                <p className="text-sm text-gray-600">{lobby.description}</p>
                <p className="text-sm text-blue-600">{lobby.type}</p>
                <div className="text-sm mt-2 text-gray-700">
                  {lobby.participants.length} / {lobby.type === 'rank' ? 2 : '∞'}
                </div>
                <div className="text-sm mt-2 text-gray-700">
                  <span className="text-sm text-gray-700">ルームID: {lobby.roomId || '未設定'}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <img src={lobby.createdBy.avatar} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-sm">{lobby.createdBy.name}</span>
                </div>

                {lobby.participants.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    {lobby.participants.map((p) => (
                      <div key={p.uid} className="flex items-center gap-1 border px-2 py-1 rounded bg-blue-100">
                        <img src={p.avatar} alt="" className="w-5 h-5 rounded-full" />
                        <span className="text-sm">{p.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 作成者のみ操作 */}
                {isOwner && (
                  <button className="mt-2 bg-black text-white px-3 py-1 rounded" onClick={() => handleDelete(lobby.id)}>
                    募集削除
                  </button>
                )}

                {/* 一般ユーザーの操作 */}
                {!isOwner && session?.user && (
                  isJoined ? (
                    <button className="mt-2 bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleLeave(lobby.id)}>離脱</button>
                  ) : (
                    <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded" onClick={() => handleApply(lobby.id)}>参加</button>
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
