'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">dekao.gg</h1>
      {session ? (
        <>
          <p>ようこそ、{session.user?.name} さん！</p>
          <button onClick={() => signOut()} className="mt-2 bg-gray-200 px-4 py-2 rounded">
            ログアウト
          </button>
        </>
      ) : (
        <button onClick={() => signIn("discord")} className="bg-blue-500 text-white px-4 py-2 rounded">
          Discordでログイン
        </button>
      )}
    </main>
  );
}
