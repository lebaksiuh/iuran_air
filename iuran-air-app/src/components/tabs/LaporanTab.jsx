import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatRupiah } from '../../lib/format'

export default function LaporanTab() {
  const [tahunList, setTahunList] = useState([])
  const [iuranPerTahun, setIuranPerTahun] = useState({})
  const [totalPemasukan, setTotalPemasukan] = useState(0)
  const [totalPengeluaran, setTotalPengeluaran] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: tahun }, { data: pembayaran }, { data: pemasukan }, { data: pengeluaran }] = await Promise.all([
        supabase.from('tahun_iuran').select('*').order('tahun_mulai'),
        supabase.from('pembayaran').select('tahun_iuran_id, nominal'),
        supabase.from('pemasukan').select('nominal'),
        supabase.from('pengeluaran').select('nominal'),
      ])

      setTahunList(tahun || [])

      const map = {}
      ;(pembayaran || []).forEach(p => {
        map[p.tahun_iuran_id] = (map[p.tahun_iuran_id] || 0) + p.nominal
      })
      setIuranPerTahun(map)
      setTotalPemasukan((pemasukan || []).reduce((a, b) => a + b.nominal, 0))
      setTotalPengeluaran((pengeluaran || []).reduce((a, b) => a + b.nominal, 0))
      setLoading(false)
    }
    fetchData()
  }, [])

  const totalSemuaIuran = Object.values(iuranPerTahun).reduce((a, b) => a + b, 0)
  const saldo = totalSemuaIuran + totalPemasukan - totalPengeluaran

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-5">Laporan Keuangan</h2>

      {loading ? (
        <p className="text-center text-gray-400 py-12">Memuat data...</p>
      ) : (
        <>
          {/* Total Iuran per Tahun */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Iuran Terkumpul</p>
          <div className={`grid gap-3 mb-5 ${tahunList.length === 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {tahunList.map(t => (
              <div key={t.id} className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <p className="text-xs text-blue-500 mb-1">Total Iuran Tahun {t.tahun_mulai}–{t.tahun_selesai}</p>
                <p className="text-xl font-bold text-blue-700">{formatRupiah(iuranPerTahun[t.id] || 0)}</p>
              </div>
            ))}
          </div>

          {/* Pemasukan, Pengeluaran, Saldo */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ringkasan Kas</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-green-50 rounded-xl border border-green-100 p-4">
              <p className="text-xs text-green-600 mb-1">Pemasukan Lain</p>
              <p className="text-xl font-bold text-green-700">{formatRupiah(totalPemasukan)}</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-100 p-4">
              <p className="text-xs text-red-500 mb-1">Total Pengeluaran</p>
              <p className="text-xl font-bold text-red-600">{formatRupiah(totalPengeluaran)}</p>
            </div>
            <div className={`rounded-xl border p-4 ${saldo >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-xs mb-1 ${saldo >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>Saldo Kas</p>
              <p className={`text-xl font-bold ${saldo >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatRupiah(saldo)}</p>
            </div>
          </div>

          {/* Tabel ringkasan per tahun */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rekapitulasi</p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {tahunList.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-600">Jumlah Iuran Tahun {t.tahun_mulai}–{t.tahun_selesai}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">{formatRupiah(iuranPerTahun[t.id] || 0)}</td>
                  </tr>
                ))}
                <tr className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-600">Jumlah Pemasukan Lain</td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-800">{formatRupiah(totalPemasukan)}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-600">Jumlah Pengeluaran</td>
                  <td className="px-5 py-3 text-right font-semibold text-red-600">{formatRupiah(totalPengeluaran)}</td>
                </tr>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-5 py-3 font-bold text-gray-800">Saldo</td>
                  <td className={`px-5 py-3 text-right font-bold text-lg ${saldo >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {formatRupiah(saldo)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
