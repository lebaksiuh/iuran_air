"""
Skrip untuk membuat akun login semua anggota secara otomatis.
Jalankan: python buat_akun_anggota.py
"""

import re
from supabase import create_client

# ===================================================
# KONFIGURASI
# ===================================================
SUPABASE_URL = "https://xmgnsalzsngxawquqdrw.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtZ25zYWx6c25neGF3cXVxZHJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAyODA1MywiZXhwIjoyMDkzNjA0MDUzfQ.HsxM7R3ui6usIL0UX4ILbU5JQIM-Q8nnrYsRR7T7rfo"
PASSWORD_DEFAULT = "lebaksiuh"
# ===================================================


def nama_ke_email(nama):
    """Konversi nama ke format email."""
    nama = nama.strip().lower()
    nama = nama.replace("'", "")       # MA'RUF → maruf

    if '/' in nama:
        # SITI SAODAH /Nia → sitisaodah.nia
        # SUKONO/H.ELAN   → sukono.h.elan
        parts = nama.split('/')
        parts = [''.join(p.split()) for p in parts]  # hapus semua spasi tiap bagian
        local = '.'.join(p for p in parts if p)      # gabung dengan titik
    else:
        # H.ANA SOBARULLOH → h.anasobarulloh
        # H.ABAS .R        → h.abas.r
        local = ''.join(nama.split())                # hapus semua spasi
        local = re.sub(r'\.{2,}', '.', local)        # hapus titik ganda (misal "abas..r")

    local = local.strip('.')                         # hapus titik di awal/akhir
    return f"{local}@iuranair.com"


sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Ambil semua pengguna dari tabel pengguna
pengguna_list = sb.table("pengguna").select("id, nomor_urut, nama").order("nomor_urut").execute().data

print(f"Membuat akun untuk {len(pengguna_list)} anggota...\n")
print(f"{'No':<4} {'Nama':<30} {'Email':<40} Status")
print("-" * 85)

berhasil = 0
gagal = 0

for p in pengguna_list:
    nomor  = p["nomor_urut"]
    nama   = p["nama"].strip()
    email  = nama_ke_email(nama)

    try:
        sb.auth.admin.create_user({
            "email": email,
            "password": PASSWORD_DEFAULT,
            "email_confirm": True,
            "user_metadata": {
                "nama": nama,
                "role": "anggota",
                "pengguna_id": p["id"],
            }
        })
        print(f"{nomor:<4} {nama:<30} {email:<40} ✓")
        berhasil += 1
    except Exception as e:
        print(f"{nomor:<4} {nama:<30} {email:<40} ✗ {e}")
        gagal += 1

print("-" * 85)
print(f"\nSelesai! Berhasil: {berhasil}, Gagal: {gagal}")
print(f"\nPassword default semua anggota: {PASSWORD_DEFAULT}")
