import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatNumber, formatRupiah } from '../utils/formatters';

const baseInputClass =
  'w-full rounded-md border border-blue-500/40 bg-blue-900/20 px-3 py-2 text-sm text-slate-100 outline-none ring-0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40';
const errorInputClass =
  'w-full rounded-md border border-rose-500/70 bg-rose-900/20 px-3 py-2 text-sm text-slate-100 outline-none ring-0 transition focus:border-rose-400 focus:ring-2 focus:ring-rose-400/40';

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

function LineItemRow({ index, item, canRemove, errors = {}, onChange, onRemove }) {
  const [focusHarga, setFocusHarga] = useState(false);
  const [touched, setTouched] = useState({});

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const showError = (field) => (touched[field] ? errors[field] : '');

  return (
    <div className="relative rounded-lg border border-slate-600 bg-slate-800/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-100">Item #{index + 1}</p>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1 text-rose-400 transition hover:bg-rose-500/20 hover:text-rose-300"
            title="Hapus item"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <label className="block">
          <RequiredLabel>Deskripsi</RequiredLabel>
          <input
            type="text"
            value={item.deskripsi}
            onChange={(e) => onChange('deskripsi', e.target.value)}
            onBlur={() => markTouched('deskripsi')}
            maxLength={120}
            className={showError('deskripsi') ? errorInputClass : baseInputClass}
            placeholder="Contoh: Ganti oli mesin"
          />
          <FieldError msg={showError('deskripsi')} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <RequiredLabel>Qty</RequiredLabel>
            <input
              type="text"
              inputMode="numeric"
              value={item.qty}
              onChange={(e) => onChange('qty', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              onBlur={() => markTouched('qty')}
              maxLength={4}
              className={showError('qty') ? errorInputClass : baseInputClass}
              placeholder="1"
            />
            <FieldError msg={showError('qty')} />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-300">Garansi / Bonus</span>
            <input
              type="text"
              value={item.garansi}
              onChange={(e) => onChange('garansi', e.target.value)}
              maxLength={40}
              className={baseInputClass}
              placeholder="6 bulan"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <RequiredLabel>Harga Satuan</RequiredLabel>
            <input
              type="text"
              inputMode="numeric"
              value={focusHarga ? item.hargaSatuan : formatNumber(item.hargaSatuan)}
              onFocus={() => setFocusHarga(true)}
              onBlur={() => {
                setFocusHarga(false);
                markTouched('hargaSatuan');
              }}
              onChange={(e) => onChange('hargaSatuan', e.target.value)}
              className={showError('hargaSatuan') ? errorInputClass : baseInputClass}
              placeholder="125000"
            />
            <FieldError msg={showError('hargaSatuan')} />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-300">Total (Auto)</span>
            <input
              type="text"
              readOnly
              value={formatRupiah(item.totalHarga)}
              className="w-full cursor-not-allowed rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default LineItemRow;
