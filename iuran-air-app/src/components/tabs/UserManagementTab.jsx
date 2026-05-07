import { useState, useEffect } from 'react'
import { Pencil, Trash2, Info, KeyRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { ROLE_LABEL, ROLE_COLOR } from '../../lib/format'
import { useAuth } from '../../contexts/AuthContext'
import UserModal from '../modals/UserModal'
import GantiPasswordModal from '../modals/GantiPasswordModal'

export default function UserManagementTab() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [pengguna, setPengguna] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [resetModal, setResetModal] = useState(null)

  async function fetchData() {
    setLoading(true)
    const [{ data: profiles }, { data: pg }] = await Promise.all([
      supabase.from('profiles').select('*, pengguna:pengguna_id(nama)').order('created_at'),
      supabase.from('pengguna').select('id, nomor_urut, nama').order('nomor_urut'),
    ])
    setUsers(profiles || [])
    setPengguna(pg || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleDelete(userId, nama) {
    if (userId === currentUser.id) return alert('Tidak bisa hapus akun sendiri.')
    if (!confirm(`Hapus user "${nama}"?`)) return
    await supabase.from('profiles').delete().eq('id', userId)
    fetchData()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Kelola User</h2>
          <p className="text-xs text-gray-500 mt-0.5">{users.length} user terdaftar</p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex gap-3">
        <Info size={16} className="text-amber-500 flex-none mt-0.5" />
        <div className="text-xs text-amber-800 space-y-1">
          <p className="font-semibold">Cara menambah user baru:</p>
          <p>
            Jalankan script Python yang sudah tersedia di folder project:
          </p>
          <ul className="list-disc ml-4 space-y-0.5">
            <li><code className="bg-amber-100 px-1 rounded">buat_akun_staff.py</code> — untuk Ketua RT, Bendahara, Penagih</li>
            <li><code className="bg-amber-100 px-1 rounded">buat_akun_anggota.py</code> — untuk semua anggota sekaligus</li>
          </ul>
          <p className="mt-1">
            Setelah akun dibuat via script, gunakan tombol <strong>Edit (✎)</strong> di bawah untuk mengubah role atau menghubungkan ke pengguna air.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pengguna Air</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Memuat...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Belum ada user. Jalankan script Python untuk membuat akun.</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className={`hover:bg-gray-50 ${u.id === currentUser?.id ? 'bg-blue-50/50' : ''}`}>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {u.nama}
                  {u.id === currentUser?.id && (
                    <span className="ml-2 text-xs text-blue-500">(Anda)</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLOR[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {u.pengguna?.nama || <span className="text-gray-300">–</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setModal(u)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit role / hubungkan pengguna">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setResetModal(u)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Reset password">
                      <KeyRound size={14} />
                    </button>
                    <button onClick={() => handleDelete(u.id, u.nama)}
                      disabled={u.id === currentUser?.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Hapus user">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {modal && (
        <UserModal
          user={modal}
          pengguna={pengguna}
          onClose={() => setModal(null)}
          onSaved={fetchData}
        />
      )}

      {resetModal && (
        <GantiPasswordModal
          targetUser={resetModal}
          onClose={() => setResetModal(null)}
        />
      )}
    </div>
  )
}
