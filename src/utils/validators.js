import { BRANCH_CODES } from '../constants/branches';

const NAME_REGEX = /^[A-Za-z .,'-]+$/;
const VEHICLE_REGEX = /^[A-Za-z0-9 .,'/-]+$/;
const MAX_FUTURE_DAYS = 30;

function isValidIsoDate(value) {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

function diffDaysFromToday(iso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

export function validateHeader(header) {
  const errors = {};

  if (!header.kodeCabang) {
    errors.kodeCabang = 'Wajib pilih kode cabang.';
  } else if (!BRANCH_CODES.includes(header.kodeCabang)) {
    errors.kodeCabang = 'Kode cabang tidak valid.';
  }

  if (!header.tanggal) {
    errors.tanggal = 'Tanggal wajib diisi.';
  } else if (!isValidIsoDate(header.tanggal)) {
    errors.tanggal = 'Format tanggal tidak valid.';
  } else {
    const diff = diffDaysFromToday(header.tanggal);
    if (diff > MAX_FUTURE_DAYS) {
      errors.tanggal = `Tanggal tidak boleh lebih dari ${MAX_FUTURE_DAYS} hari ke depan.`;
    }
  }

  const nama = (header.namaPelanggan || '').trim();
  if (!nama) {
    errors.namaPelanggan = 'Nama pelanggan wajib diisi.';
  } else if (nama.length < 2 || nama.length > 60) {
    errors.namaPelanggan = 'Nama pelanggan harus 2–60 karakter.';
  } else if (!NAME_REGEX.test(nama)) {
    errors.namaPelanggan = 'Hanya huruf, spasi, titik, dan koma.';
  }

  const jenis = (header.jenisKendaraan || '').trim();
  if (!jenis) {
    errors.jenisKendaraan = 'Jenis kendaraan wajib diisi.';
  } else if (jenis.length < 2 || jenis.length > 50) {
    errors.jenisKendaraan = 'Jenis kendaraan harus 2–50 karakter.';
  } else if (!VEHICLE_REGEX.test(jenis)) {
    errors.jenisKendaraan = 'Karakter tidak valid.';
  }

  const noPolisi = String(header.noPolisi || '').trim();
  if (!noPolisi) {
    errors.noPolisi = 'No. Polisi wajib diisi.';
  } else if (noPolisi.length > 20) {
    errors.noPolisi = 'No. Polisi maksimal 20 karakter.';
  }

  if (header.kilometer === '' || header.kilometer === null || header.kilometer === undefined) {
    errors.kilometer = 'Kilometer wajib diisi.';
  } else {
    const kmStr = String(header.kilometer);
    if (!/^\d+$/.test(kmStr)) {
      errors.kilometer = 'Kilometer hanya angka.';
    } else {
      const km = Number(kmStr);
      if (km < 0 || km > 999999) {
        errors.kilometer = 'Kilometer harus 0–999.999.';
      }
    }
  }

  return errors;
}

export function isItemFilled(item) {
  return (
    String(item.deskripsi || '').trim() !== '' ||
    item.qty !== '' ||
    item.hargaSatuan !== '' ||
    String(item.garansi || '').trim() !== ''
  );
}

export function validateItem(item) {
  const errors = {};
  const desc = (item.deskripsi || '').trim();
  if (desc.length < 2 || desc.length > 120) {
    errors.deskripsi = 'Deskripsi harus 2–120 karakter.';
  }

  const qtyNum = Number(item.qty);
  if (item.qty === '' || isNaN(qtyNum)) {
    errors.qty = 'Qty wajib diisi.';
  } else if (!Number.isInteger(qtyNum) || qtyNum < 1 || qtyNum > 9999) {
    errors.qty = 'Qty harus bilangan bulat 1–9.999.';
  }

  const hargaNum = Number(item.hargaSatuan);
  if (item.hargaSatuan === '' || isNaN(hargaNum)) {
    errors.hargaSatuan = 'Harga satuan wajib diisi.';
  } else if (hargaNum < 1 || hargaNum > 9999999999) {
    errors.hargaSatuan = 'Harga harus 1–9.999.999.999.';
  }

  return errors;
}

export function validateItems(items) {
  const filled = items.filter(isItemFilled);
  if (filled.length === 0) {
    return { itemsError: 'Minimal 1 item harus diisi.', perItem: {} };
  }

  const perItem = {};
  for (const it of filled) {
    const e = validateItem(it);
    if (Object.keys(e).length > 0) perItem[it.id] = e;
  }
  return { itemsError: '', perItem };
}

export function validateAll(data) {
  const headerErrors = validateHeader(data.header);
  const { itemsError, perItem } = validateItems(data.items);
  const isValid =
    Object.keys(headerErrors).length === 0 && !itemsError && Object.keys(perItem).length === 0;
  return { headerErrors, itemsError, perItem, isValid };
}
