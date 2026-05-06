import { useState, useEffect } from 'react'
import { Droplets, LogOut, CheckCircle2, XCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { formatRupiah, BULAN_IURAN, ROLE_LABEL, ROLE_COLOR } from '../lib/format'

export default function AnggotaPage() {
  const { profile, signOut } = useAuth()
  const [tahunList, setTahunList] = useState([])
  const [tahunAktif, setTahunAktif] = useState(null)
  const [pembayaran, setPembayaran] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('tahun_iuran').select('*').order('tahun_mulai', { ascending: false })
      .then(({ data }) => {
        setTahunList(data || [])
        if (data?.length) setTahunAktif(data[0])
      })
  }, [])

  useEffect(() => {
    if (!tahunAktif || !profile?.pengguna_id) { setLoading(false); return }
    setLoading(true)
    supabase.from('pembayaran')
      .select('bulan, nominal, tanggal_bayar')
      .eq('pengguna_id', profile.pengguna_id)
      .eq('tahun_iuran_id', tahunAktif.id)
      .then(({ data }) => {
        setPembayaran(data || [])
        setLoading(false)
      })
  }, [tahunAktif, profile?.pengguna_id])

  const mapBulan = {}
  pembayaran.forEach(p => { mapBulan[p.bulan] = p })

  const totalBayar = pembayaran.reduce((a, b) => a + b.nominal, 0)
  const lunasCount = pembayaran.length
  const belumCount = 12 - lunasCount

  if (!profile?.pengguna_id) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets size={20} className="text-blue-600" />
              <span className="font-bold text-gray-800">Iuran Air</span>
            </div>
            <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600">
              <LogOut size={15} /> Keluar
            </button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <XCircle size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Akun Anda belum dihubungkan ke data pengguna air.</p>
            <p className="text-sm text-gray-400 mt-1">Hubungi admin untuk menghubungkan akun.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={20} className="text-blue-600" />
            <span className="font-bold text-gray-800">Iuran Air</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLOR[profile?.role]}`}>
              {ROLE_LABEL[profile?.role]}
            </span>
            <button onClick={signOut} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        {/* Header Info */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white mb-4 shadow-md">
          <p className="text-blue-200 text-xs mb-1">Halo,</p>
          <h1 className="text-xl font-bold mb-1">{profile?.pengguna?.nama || profile?.nama}</h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="relative">
              <select
                value={tahunAktif?.id || ''}
                onChange={e => setTahunAktif(tahunList.find(t => t.id === e.target.value))}
                className="appearance-none bg-white/20 border border-white/30 text-white text-sm px-3 py-1.5 pr-6 rounded-lg focus:outline-none"
              >
                {tahunList.map(t => (
                  <option key={t.id} value={t.id} className="text-gray-800">
                    Tahun {t.label} ({t.tahun_mulai}/{t.tahun_selesai})
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm text-center">
            <p className="text-xl font-bold text-blue-600">{formatRupiah(totalBayar)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Dibayar</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{lunasCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Bulan Lunas</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm text-center">
            <p className="text-2xl font-bold text-red-500">{belumCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Belum Bayar</p>
          </div>
        </div>

        {/* Status per Bulan */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">
              Status Pembayaran
              <span className="ml-2 text-xs font-normal text-gray-400">
                Okt {tahunAktif?.tahun_mulai} – Sep {tahunAktif?.tahun_selesai}
              </span>
            </p>
          </div>
          {loading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Memuat...</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {BULAN_IURAN.map(({ bulan, nama }) => {
                const bayar = mapBulan[bulan]
                return (
                  <div key={bulan} className={`flex items-center justify-between px-4 py-3 ${bayar ? 'bg-green-50/50' : ''}`}>
                    <div className="flex items-center gap-3">
                      {bayar
                        ? <CheckCircle2 size={18} className="text-green-500 flex-none" />
                        : <XCircle size={18} className="text-gray-300 flex-none" />
                      }
                      <span className={`text-sm font-medium ${bayar ? 'text-gray-800' : 'text-gray-400'}`}>
                        {nama}
                      </span>
                    </div>
                    <div className="text-right">
                      {bayar ? (
                        <>
                          <p className="text-sm font-semibold text-green-600">{formatRupiah(bayar.nominal)}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(bayar.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400">Belum bayar</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
