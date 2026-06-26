import { Car, Download, FileText, Plus, RotateCcw, Wrench } from 'lucide-react';
import { useState } from 'react';
import LineItemRow from './LineItemRow';
import SectionTitle from './SectionTitle';
import { BRANCHES } from '../constants/branches';
import { buildNoEstimasi, formatRupiah } from '../utils/formatters';

const inputClass =
  'w-full rounded-md border border-blue-500/40 bg-blue-900/20 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40';
const inputErrorClass =
  'w-full rounded-md border border-rose-500/70 bg-rose-900/20 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-400/40';

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] font-medium text-rose-300">{msg}</p>;
}

function RequiredLabel({ children }) {
  return (
    <span className="mb-1 block text-xs text-slate-300">
      {children} <span className="text-rose-400">*</span>
    </span>
  );
}

function FormPanel({
  data,
  grandTotal,
  canDownload,
  validation,
  onUpdateHeader,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onDownload,
  onReset,
}) {
  const [touched, setTouched] = useState({});
  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const headerErrors = validation?.headerErrors || {};
  const showError = (field) => (touched[field] ? headerErrors[field] : '');

  const noEstimasiPreview = buildNoEstimasi(
    data.header.kodeCabang,
    data.header.tanggal,
    data.header.noPolisi,
  );

  const downloadDisabledReason = !canDownload
    ? 'Lengkapi semua field & minimal 1 item valid sebelum download.'
    : '';

  return (
    <aside className="h-full w-full overflow-y-auto border-r border-slate-700 bg-slate-900 lg:w-[400px]">
      <div className="space-y-5 p-6">
        <header>
          <h1 className="text-lg font-bold text-white">Estimasi Harga - Dokter Mobil</h1>
          <p className="mt-1 text-sm text-slate-400">
            Isi data pelanggan, pekerjaan, lalu download dokumen PDF.
          </p>
        </header>

        <section className="rounded-lg bg-slate-700/60 p-4">
          <SectionTitle
            icon={FileText}
            title="Informasi Dokumen"
            tooltip="Nomor estimasi otomatis tersusun dari Kode Cabang, Tanggal, dan No. Polisi."
          />
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <RequiredLabel>Kode Cabang</RequiredLabel>
                <select
                  value={data.header.kodeCabang}
                  onChange={(e) => onUpdateHeader('kodeCabang', e.target.value)}
                  onBlur={() => markTouched('kodeCabang')}
                  className={`${showError('kodeCabang') ? inputErrorClass : inputClass} [color-scheme:dark]`}
                >
                  <option value="" className="bg-slate-900 text-slate-200">
                    Pilih cabang...
                  </option>
                  {BRANCHES.map((b) => (
                    <option key={b.code} value={b.code} className="bg-slate-900 text-slate-100">
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
                <FieldError msg={showError('kodeCabang')} />
              </label>
              <label className="block">
                <RequiredLabel>Tanggal</RequiredLabel>
                <input
                  type="date"
                  value={data.header.tanggal}
                  onChange={(e) => onUpdateHeader('tanggal', e.target.value)}
                  onBlur={() => markTouched('tanggal')}
                  className={showError('tanggal') ? inputErrorClass : inputClass}
                />
                <FieldError msg={showError('tanggal')} />
              </label>
            </div>
            <div className="rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-xs">
              <span className="text-slate-400">Preview No Estimasi: </span>
              <span className="font-mono font-semibold text-slate-100">
                {noEstimasiPreview || '—'}
              </span>
            </div>
            <label className="block">
              <RequiredLabel>Nama Pelanggan</RequiredLabel>
              <input
                type="text"
                value={data.header.namaPelanggan}
                onChange={(e) => onUpdateHeader('namaPelanggan', e.target.value)}
                onBlur={() => markTouched('namaPelanggan')}
                maxLength={60}
                className={showError('namaPelanggan') ? inputErrorClass : inputClass}
                placeholder="Nama lengkap pelanggan"
              />
              <FieldError msg={showError('namaPelanggan')} />
            </label>
          </div>
        </section>

        <section className="rounded-lg bg-slate-700/60 p-4">
          <SectionTitle
            icon={Car}
            title="Data Kendaraan"
            tooltip="Isi data kendaraan sesuai kebutuhan. Kilometer hanya menerima angka."
          />
          <div className="space-y-3">
            <label className="block">
              <RequiredLabel>Jenis Kendaraan / Tipe</RequiredLabel>
              <input
                type="text"
                value={data.header.jenisKendaraan}
                onChange={(e) => onUpdateHeader('jenisKendaraan', e.target.value)}
                onBlur={() => markTouched('jenisKendaraan')}
                maxLength={50}
                className={showError('jenisKendaraan') ? inputErrorClass : inputClass}
                placeholder="Toyota Avanza 1.3 G MT 2023"
              />
              <FieldError msg={showError('jenisKendaraan')} />
            </label>
            <label className="block">
              <RequiredLabel>No. Polisi</RequiredLabel>
              <input
                type="text"
                value={data.header.noPolisi}
                onChange={(e) => onUpdateHeader('noPolisi', e.target.value.toUpperCase())}
                onBlur={() => markTouched('noPolisi')}
                maxLength={20}
                className={(showError('noPolisi') ? inputErrorClass : inputClass) + ' uppercase'}
                placeholder="B 1234 XYZ"
                autoComplete="off"
                autoCapitalize="characters"
              />
              <FieldError msg={showError('noPolisi')} />
            </label>
            <label className="block">
              <RequiredLabel>Kilometer (KM)</RequiredLabel>
              <input
                type="text"
                inputMode="numeric"
                value={data.header.kilometer}
                onChange={(e) =>
                  onUpdateHeader('kilometer', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                }
                onBlur={() => markTouched('kilometer')}
                maxLength={6}
                className={showError('kilometer') ? inputErrorClass : inputClass}
                placeholder="45000"
              />
              <FieldError msg={showError('kilometer')} />
            </label>
          </div>
        </section>

        <section className="rounded-lg bg-slate-700/60 p-4">
          <SectionTitle
            icon={Wrench}
            title="Daftar Pekerjaan / Part"
            tooltip="Tambah item sesuai kebutuhan. Total per baris dihitung qty × harga satuan."
          />

          {validation?.itemsError && (
            <p className="mb-2 rounded-md border border-rose-500/50 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-200">
              {validation.itemsError}
            </p>
          )}

          <div className="space-y-3">
            {data.items.map((item, index) => (
              <LineItemRow
                key={item.id}
                index={index}
                item={item}
                canRemove={data.items.length > 1}
                errors={validation?.perItem?.[item.id] || {}}
                onChange={(field, value) => onUpdateItem(item.id, field, value)}
                onRemove={() => {
                  if (window.confirm('Hapus item ini?')) {
                    onRemoveItem(item.id);
                  }
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onAddItem}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-rose-500/70 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10"
          >
            <Plus size={16} />
            Tambah Item
          </button>
        </section>

        <section className="rounded-lg border border-rose-600/50 bg-rose-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-rose-200">Grand Total</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatRupiah(grandTotal)}</p>
        </section>

        <button
          type="button"
          disabled={!canDownload}
          onClick={onDownload}
          title={downloadDisabledReason}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
        >
          <Download size={16} />
          Download PDF
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
        >
          <RotateCcw size={14} />
          Reset Form
        </button>
      </div>
    </aside>
  );
}

export default FormPanel;
