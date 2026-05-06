import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatRupiah } from '../../lib/format'

const TARIF_OPTIONS = [20000, 30000, 40000, 50000]

export default function PenggunaModal({ pengguna, onClose, onSaved }) {
  const isEdit = !!pengguna
  const [form, setForm] = useState({
    nomor_urut: '',
    nama: '',
    nominal_iuran: 20000,
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (pengguna) {
      setForm({
        nomor_urut: pengguna.nomor_urut,
        nama: pengguna.nama,
        nominal_iuran: pengguna.nominal_iuran,
        is_active: pengguna.is_active,
      })
    }
  }, [pengguna])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      nomor_urut: Number(form.nomor_urut),
      nama: form.nama.trim().toUpperCase(),
      nominal_iuran: Number(form.nominal_iuran),
      is_active: form.is_active,
    }

    const { error: err } = isEdit
      ? await supabase.from('pengguna').update(payload).eq('id', pengguna.id)
      : await supabase.from('pengguna').insert(payload)

    if (err) {
      setError(err.message)
    } else {
      onSaved()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">No. Urut</label>
              <input
                type="number"
                value={form.nomor_urut}
                onChange={e => setForm(f => ({ ...f, nomor_urut: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
              <input
                type="text"
                value={form.nama}
                onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="NAMA PENGGUNA"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tarif Iuran/Bulan</label>
            <div className="grid grid-cols-4 gap-2">
              {TARIF_OPTIONS.map(tarif => (
                <button
                  key={tarif}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, nominal_iuran: tarif }))}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                    form.nominal_iuran === tarif
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  {formatRupiah(tarif)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Pengguna aktif</label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2 text-sm font-medium transition-colors">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
