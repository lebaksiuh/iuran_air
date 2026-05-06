import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatRupiah } from '../../lib/format'
import KasModal from '../modals/KasModal'

export default function PengeluaranTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  async function fetchData() {
    setLoading(true)
    const { data: rows } = await supabase.from('pengeluaran').select('*').order('tanggal', { ascending: false })
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleDelete(id) {
    if (!confirm('Hapus data pengeluaran ini?')) return
    await supabase.from('pengeluaran').delete().eq('id', id)
    fetchData()
  }

  const total = data.reduce((a, b) => a + b.nominal, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Pengeluaran</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total: <span className="font-semibold text-red-600">{formatRupiah(total)}</span>
          </p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={15} /> Tambah
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
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
            ) : data.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Belum ada data pengeluaran</td></tr>
            ) : data.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-gray-800">{d.keterangan}</td>
                <td className="px-4 py-3 text-right font-medium text-red-600">{formatRupiah(d.nominal)}</td>
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
          {data.length > 0 && (
            <tfoot>
              <tr className="bg-red-50 border-t border-red-100">
                <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">Total Pengeluaran</td>
                <td className="px-4 py-3 text-right font-bold text-red-700">{formatRupiah(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {modal && (
        <KasModal
          type="pengeluaran"
          item={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  )
}
