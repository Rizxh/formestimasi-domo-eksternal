export const MIN_ROWS = 15;
export const ITEMS_PER_FIRST_PAGE = 10;

const today = new Date().toISOString().split('T')[0];

export const DEFAULT_HEADER = {
  kodeCabang: '',
  tanggal: today,
  namaPelanggan: '',
  jenisKendaraan: '',
  noPolisi: '',
  kilometer: '',
};

export const createEmptyItem = () => ({
  id: Date.now() + Math.random(),
  deskripsi: '',
  qty: '',
  hargaSatuan: '',
  totalHarga: '',
  garansi: '',
});

export const DEFAULT_ITEMS = [createEmptyItem()];
