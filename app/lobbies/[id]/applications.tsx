'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { db } from '../../firebaseConfig'
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore'
import { useParams } from 'next/navigation'  // useParams をインポート

export default function ApplicationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = useParams()  // useParams() で URL パラメータを取得
  const [lobby, setLobby] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const uid = session?.user?.email || 'unknown-id'

  useEffect(() => {
    const fetchLobby = async () => {
      if (!id) return
      const docRef = doc(db, 'lobbies', id as string)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setLobby(docSnap.data())
        setLoading(false)
      }
    }

    fetchLobby()
  }, [id])

  // オーナー確認
  if (!lobby || loading) return <div>Loading...</div>
  if (lobby.createdBy.uid !== uid) {
    return <div>あなたはこのロビーのオーナーではありません</div>
  }

  // 申請の承認
  const handleApprove = async (applicant: any) => {
    const lobbyRef = doc(db, 'lobbies', id as string)
    await updateDoc(lobbyRef, {
      applicants: arrayRemove(applicant),
      participants: arrayUnion(applicant),
    })
  }

  // 申請の却下
  const handleReject = async (applicant: any) => {
    const lobbyRef = doc(db, 'lobbies', id as string)
    await updateDoc(lobbyRef, {
      applicants: arrayRemove(applicant),
    })
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">申請者一覧</h1>
      {lobby.applicants?.length === 0 ? (
        <p>現在申請者はありません</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {lobby.applicants.map((applicant: any) => (
            <li key={applicant.uid} className="border p-4 rounded">
              <div className="flex items-center gap-2">
                <img src={applicant.avatar} alt="" className="w-8 h-8 rounded-full" />
                <span className="text-lg">{applicant.name}</span>
              </div>
              <div className="mt-2 flex gap-4">
                <button
                  onClick={() => handleApprove(applicant)}
                  className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
                >
                  承認
                </button>
                <button
                  onClick={() => handleReject(applicant)}
                  className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
                >
                  却下
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
