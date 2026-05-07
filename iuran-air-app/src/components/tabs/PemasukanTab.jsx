import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatRupiah } from '../../lib/format'
import KasModal from '../modals/KasModal'

const PER_PAGE = 10

export default function PemasukanTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  async function fetchData() {
    setLoading(true)
    const { data: rows } = await supabase.from('pemasukan').select('*').order('tanggal', { ascending: false })
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleDelete(id) {
    if (!confirm('Hapus data pemasukan ini?')) return
    await supabase.from('pemasukan').delete().eq('id', id)
    fetchData()
  }

  const total = data.reduce((a, b) => a + b.nominal, 0)

  const filtered = data.filter(d =>
    d.keterangan?.toLowerCase().includes(search.toLowerCase()) ||
    new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      .toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * PER_PAGE
  const paginated = filtered.slice(startIdx, startIdx + PER_PAGE)

  function handleSearch(val) {
    setSearch(val)
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Pemasukan Tambahan</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total: <span className="font-semibold text-green-600">{formatRupiah(total)}</span>
          </p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={15} /> Tambah
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Cari keterangan atau tanggal..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Keterangan</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nominal</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">Memuat...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">
                  {search ? 'Tidak ada hasil pencarian' : 'Belum ada data pemasukan'}
                </td></tr>
              ) : paginated.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{d.keterangan}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">{formatRupiah(d.nominal)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setModal(d)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {!loading && data.length > 0 && (
              <tfoot>
                <tr className="bg-green-50 border-t border-green-100">
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">Total Pemasukan</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">{formatRupiah(total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              {startIdx + 1}–{Math.min(startIdx + PER_PAGE, filtered.length)} dari {filtered.length} data
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-gray-600 px-2 font-medium">{safePage} / {totalPages}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <KasModal
          type="pemasukan"
          item={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  )
}
