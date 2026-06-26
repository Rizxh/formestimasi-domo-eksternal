import { useEffect, useMemo, useRef, useState } from 'react';
import FormPanel from './components/FormPanel';
import PreviewPanel from './components/PreviewPanel';
import { DEFAULT_HEADER, DEFAULT_ITEMS, createEmptyItem } from './constants/defaults';
import { computeGrandTotal, computeRowTotal, parseNumber } from './utils/formatters';
import { generatePDF } from './utils/pdfGenerator';
import { validateAll } from './utils/validators';

const STORAGE_KEY = 'estimasi-dokter-mobil-eksternal-v1';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.header || !Array.isArray(parsed?.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function App() {
  const [data, setData] = useState(() => loadFromStorage() ?? {
    header: DEFAULT_HEADER,
    items: DEFAULT_ITEMS,
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [activeView, setActiveView] = useState('form');

  const grandTotal = useMemo(() => computeGrandTotal(data.items), [data.items]);
  const validation = useMemo(() => validateAll(data), [data]);
  const canDownload = validation.isValid;

  const updateHeader = (field, value) => {
    setData((prev) => ({
      ...prev,
      header: { ...prev.header, [field]: value },
    }));
  };

  const updateItem = (id, field, value) => {
    setData((prev) => {
      const nextItems = prev.items.map((item) => {
        if (item.id !== id) return item;
        const nextItem = { ...item };
        if (field === 'qty') {
          nextItem.qty = value === '' ? '' : parseNumber(value);
        } else if (field === 'hargaSatuan') {
          nextItem.hargaSatuan = value === '' ? '' : parseNumber(value);
        } else {
          nextItem[field] = value;
        }
        nextItem.totalHarga = computeRowTotal(nextItem.qty, nextItem.hargaSatuan);
        return nextItem;
      });
      return { ...prev, items: nextItems };
    });
  };

  const addItem = () => {
    setData((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }));
  };

  const removeItem = (id) => {
    setData((prev) => {
      if (prev.items.length <= 1) return prev;
      return { ...prev, items: prev.items.filter((item) => item.id !== id) };
    });
  };

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4500);
  };

  const handleReset = () => {
    if (!window.confirm('Reset semua data form? Data yang belum di-download akan hilang.')) return;
    const fresh = { header: DEFAULT_HEADER, items: [createEmptyItem()] };
    setData(fresh);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleDownload = async () => {
    if (!canDownload) return;
    try {
      await generatePDF(data);
      showToast('PDF berhasil di-download!', 'success');
    } catch {
      showToast('Gagal membuat PDF. Cek logo di folder public.', 'error');
    }
  };

  return (
    <div className="h-full bg-slate-900 text-slate-100">
      <div className="mx-auto flex h-full max-w-[1800px] flex-col lg:flex-row">
        <div className="app-mobile-tabs flex items-center justify-between border-b border-slate-700/80 bg-slate-900 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setActiveView('form')}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeView === 'form' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Form
          </button>
          <button
            type="button"
            onClick={() => setActiveView('preview')}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeView === 'preview' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Preview
          </button>
        </div>

        <div className={`app-form-panel ${activeView === 'preview' ? 'hidden' : 'block'} lg:block`}>
          <FormPanel
            data={data}
            grandTotal={grandTotal}
            canDownload={canDownload}
            validation={validation}
            onUpdateHeader={updateHeader}
            onUpdateItem={updateItem}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        </div>

        <div className={`min-w-0 flex-1 ${activeView === 'form' ? 'hidden' : 'block'} lg:block`}>
          <PreviewPanel data={data} grandTotal={grandTotal} />
        </div>
      </div>

      {toast && (
        <div
          className={`pointer-events-none fixed bottom-5 right-5 z-50 flex max-w-xs items-start gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg toast-anim ${
            toast.type === 'success' ? 'bg-emerald-600' :
            toast.type === 'error'   ? 'bg-red-600'    :
            'bg-blue-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
