'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <main className="p-10">
      {session ? (
        <>
          <p className="mb-4">ようこそ、{session.user?.name} さん！</p>
          <button
            onClick={() => signOut()}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            ログアウト
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn('discord')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Discordでログイン
        </button>
      )}
    </main>
  )
}
