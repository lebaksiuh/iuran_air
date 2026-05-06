import { Droplets, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ROLE_LABEL, ROLE_COLOR } from '../lib/format'

export default function Navbar() {
  const { profile, signOut } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets size={22} className="text-blue-600" />
          <span className="font-bold text-gray-800 text-base">Iuran Air</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLOR[profile?.role] || 'bg-gray-100 text-gray-600'}`}>
            {ROLE_LABEL[profile?.role] || '-'}
          </span>
          <span className="text-sm text-gray-600 hidden sm:block">{profile?.nama}</span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
            title="Keluar"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
