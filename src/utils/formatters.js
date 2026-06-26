const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(value) {
  if (value === '' || value === null || value === undefined || isNaN(Number(value))) {
    return '';
  }
  return 'Rp ' + rupiahFormatter.format(Number(value));
}

export function formatNumber(value) {
  if (value === '' || value === null || value === undefined || isNaN(Number(value))) {
    return '';
  }
  return rupiahFormatter.format(Number(value));
}

export function parseNumber(value) {
  if (value === '' || value === null || value === undefined) return '';
  const cleaned = String(value).replace(/[^0-9]/g, '');
  if (cleaned === '') return '';
  return Number(cleaned);
}

export function computeRowTotal(qty, hargaSatuan) {
  const q = Number(qty) || 0;
  const h = Number(hargaSatuan) || 0;
  if (q === 0 || h === 0) return '';
  return q * h;
}

export function computeGrandTotal(items) {
  return items.reduce((sum, item) => {
    const t = Number(item.totalHarga) || 0;
    return sum + t;
  }, 0);
}

export function formatDateID(dateIso) {
  if (!dateIso) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateIso));
  } catch {
    return dateIso;
  }
}

export function buildNoEstimasi(kodeCabang, tanggalIso, noPolisi) {
  if (!kodeCabang || !tanggalIso) return '';
  const parts = String(tanggalIso).split('-');
  if (parts.length !== 3) return '';
  const [yyyy, mm, dd] = parts;
  const dateStr = `${yyyy}${String(mm).padStart(2, '0')}${String(dd).padStart(2, '0')}`;
  const plate = String(noPolisi || '').replace(/\s+/g, '').toUpperCase();
  return plate ? `${kodeCabang}-${dateStr}-${plate}` : `${kodeCabang}-${dateStr}`;
}
