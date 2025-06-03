'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gray-800 text-white py-3 px-6 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold hover:underline">
        DEKAO-GG
      </Link>
      <nav className="flex gap-4 text-sm">
        <Link href="/lobbies" className="hover:underline">
          募集一覧
        </Link>
        <Link href="/lobbies/new" className="hover:underline">
          募集作成
        </Link>
      </nav>
    </header>
  )
}
