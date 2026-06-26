import { ITEMS_PER_FIRST_PAGE } from '../constants/defaults';
import {
  PREVIEW_MARGIN_PX,
  PREVIEW_PAGE_HEIGHT_PX,
  PREVIEW_PAGE_WIDTH_PX,
} from '../constants/previewLayout';
import { TABLE_COLUMN_WIDTHS_MM, TABLE_HEADERS, TABLE_WIDTH_MM } from '../constants/tableLayout';
import { buildNoEstimasi, formatDateID, formatRupiah } from '../utils/formatters';

const WM_COLS_X = [30, 200, 380];
const WM_ROWS_Y = [40, 200, 360, 520, 680];

function WatermarkGrid() {
  return WM_ROWS_Y.flatMap((y, rowIdx) => {
    const stagger = rowIdx % 2 === 1 ? 85 : 0;
    return WM_COLS_X.map((x, colIdx) => (
      <img
        key={`wm-${rowIdx}-${colIdx}`}
        src="/logo-dokter-mobil-pasti-beres.png"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: x + stagger,
          top: y,
          width: 85,
          height: 'auto',
          opacity: 0.05,
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'rotate(-30deg)',
          zIndex: 0,
        }}
      />
    ));
  });
}

function PageFrame({ pageIndex, totalPages, children }) {
  return (
    <div
      className="preview-doc preview-page mx-auto rounded bg-white shadow-2xl"
      style={{ width: PREVIEW_PAGE_WIDTH_PX }}
    >
      <div
        className="preview-page-inner relative bg-white text-black"
        style={{
          width: PREVIEW_PAGE_WIDTH_PX,
          minHeight: PREVIEW_PAGE_HEIGHT_PX,
          padding: PREVIEW_MARGIN_PX,
          boxSizing: 'border-box',
        }}
      >
        <WatermarkGrid />
        <div className="preview-page-content" style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
        {totalPages > 1 && (
          <div
            style={{
              position: 'absolute',
              right: PREVIEW_MARGIN_PX,
              bottom: 16,
              fontSize: '7pt',
              color: '#555',
              fontFamily: 'Arial, sans-serif',
              zIndex: 1,
            }}
          >
            Halaman {pageIndex + 1} / {totalPages}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value, labelWidth }) {
  return (
    <div className="preview-info-row" style={{ gridTemplateColumns: `${labelWidth} 10px 1fr` }}>
      <span className="preview-info-row__label">{label}</span>
      <span className="preview-info-row__colon">:</span>
      <span className="preview-info-row__value">{value || ' '}</span>
    </div>
  );
}

function HeaderArea({ noEstimasiText, header }) {
  const infoRows = [
    [
      { label: 'No Estimasi', value: noEstimasiText, labelWidth: '35%' },
      { label: 'Jenis Kendaraan/Tipe', value: header.jenisKendaraan, labelWidth: '42%' },
    ],
    [
      { label: 'Tanggal', value: formatDateID(header.tanggal), labelWidth: '35%' },
      { label: 'No. Polisi', value: header.noPolisi, labelWidth: '42%' },
    ],
    [
      { label: 'Nama Pelanggan', value: header.namaPelanggan, labelWidth: '35%' },
      { label: 'Kilometer (KM)', value: header.kilometer, labelWidth: '42%' },
    ],
  ];

  return (
    <>
      <div>
        <img
          src="/logo-dokter-mobil-pasti-beres.png"
          alt="Dokter Mobil"
          style={{ width: 100, height: 'auto' }}
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: 18, marginBottom: 18 }}>
        <span
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 1,
            color: '#000',
          }}
        >
          ESTIMASI HARGA
        </span>
      </div>

      <div className="preview-info-grid">
        {infoRows.map(([left, right], rowIdx) => (
          <div key={rowIdx} className="preview-info-pair">
            <InfoField {...left} />
            <InfoField {...right} />
          </div>
        ))}
      </div>
    </>
  );
}

function TableHeader() {
  return (
    <thead>
      <tr style={{ backgroundColor: '#E0E0E0' }}>
        {TABLE_HEADERS.map((header, idx) => {
          const lines = header.split('\n');
          return (
            <th key={idx} className="preview-items-table__head">
              {lines.length > 1 ? (
                <>
                  {lines[0]}
                  <br />
                  {lines[1]}
                </>
              ) : (
                header
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

function ItemsRows({ items, startIndex }) {
  return items.map((item, idx) => (
    <tr key={item.id}>
      <td className="preview-items-table__cell" style={{ textAlign: 'center' }}>
        {startIndex + idx + 1}
      </td>
      <td className="preview-items-table__cell" style={{ textAlign: 'left' }}>
        {item.deskripsi}
      </td>
      <td className="preview-items-table__cell" style={{ textAlign: 'center' }}>
        {item.qty}
      </td>
      <td className="preview-items-table__cell" style={{ textAlign: 'right' }}>
        {item.hargaSatuan !== '' ? formatRupiah(item.hargaSatuan) : ''}
      </td>
      <td className="preview-items-table__cell" style={{ textAlign: 'right' }}>
        {item.totalHarga !== '' ? formatRupiah(item.totalHarga) : ''}
      </td>
      <td className="preview-items-table__cell" style={{ textAlign: 'center' }}>
        {item.garansi}
      </td>
    </tr>
  ));
}

function GrandTotalRow({ grandTotal }) {
  return (
    <tr style={{ backgroundColor: '#E0E0E0', fontWeight: 700 }}>
      <td colSpan={3} className="preview-items-table__cell" style={{ textAlign: 'center' }}>
        Grand Total
      </td>
      <td className="preview-items-table__cell" />
      <td className="preview-items-table__cell" style={{ textAlign: 'right' }}>
        {grandTotal > 0 ? formatRupiah(grandTotal) : ''}
      </td>
      <td className="preview-items-table__cell" />
    </tr>
  );
}

function ItemsTable({ items, startIndex, grandTotal, showGrandTotal, marginTop = 30 }) {
  return (
    <div className="preview-items-table-wrap" style={{ marginTop }}>
      <table className="preview-items-table">
        <colgroup>
          {TABLE_COLUMN_WIDTHS_MM.map((widthMm, idx) => (
            <col key={idx} style={{ width: `${(widthMm / TABLE_WIDTH_MM) * 100}%` }} />
          ))}
        </colgroup>
        <TableHeader />
        <tbody>
          <ItemsRows items={items} startIndex={startIndex} />
          {showGrandTotal && <GrandTotalRow grandTotal={grandTotal} />}
        </tbody>
      </table>
    </div>
  );
}

function FooterArea() {
  return (
    <>
      <div className="preview-footer-signatures">
        {[
          { label: 'Mengetahui Estimasi Harga', name: 'Supervisor' },
          { label: 'Mengetahui Estimasi Harga', name: 'Customer' },
          { label: 'Menyetujui Pengerjaan', name: 'Customer' },
        ].map(({ label, name }, idx) => (
          <div key={idx} className="preview-footer-signatures__col">
            <div className="preview-footer-signatures__label">{label}</div>
            <div className="preview-footer-signatures__space" />
            <div className="preview-footer-signatures__line" />
            <p className="preview-footer-signatures__name">{name}</p>
          </div>
        ))}
      </div>

      <div className="preview-notes-box">
        <p className="mb-[2px] font-bold">Notes:</p>
        <p>
          - Pihak Dokter Mobil tidak pernah melakukan penggantian sparepart maupun jasa servis
          tanpa persetujuan pemilik mobil.
        </p>
        <p>
          - Form estimasi harga ini hanya sah apabila dicetak oleh Dokter Mobil. Segala perubahan,
          penambahan, koreksi, atau keterangan yang ditulis tangan dianggap tidak berlaku.
        </p>
      </div>
    </>
  );
}

function PreviewPanel({ data, grandTotal }) {
  const filledItems = data.items.filter(
    (item) => item.deskripsi.trim() !== '' || item.qty !== '' || item.hargaSatuan !== '',
  );

  const noEstimasiText = buildNoEstimasi(
    data.header.kodeCabang,
    data.header.tanggal,
    data.header.noPolisi,
  );
  const totalPages = filledItems.length > ITEMS_PER_FIRST_PAGE ? 2 : 1;
  const firstPageItems = filledItems.slice(0, ITEMS_PER_FIRST_PAGE);
  const secondPageItems = filledItems.slice(ITEMS_PER_FIRST_PAGE);

  return (
    <main className="app-preview-panel h-full overflow-auto bg-slate-800 p-3 lg:p-6">
      <div className="space-y-4">
        <PageFrame pageIndex={0} totalPages={totalPages}>
          <HeaderArea noEstimasiText={noEstimasiText} header={data.header} />
          <ItemsTable
            items={firstPageItems}
            startIndex={0}
            grandTotal={grandTotal}
            showGrandTotal={totalPages === 1}
          />
          {totalPages === 1 && <FooterArea />}
        </PageFrame>

        {totalPages > 1 && (
          <PageFrame pageIndex={1} totalPages={totalPages}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#000',
                }}
              >
                ESTIMASI HARGA — Lanjutan ({noEstimasiText || ' '})
              </span>
            </div>
            <ItemsTable
              items={secondPageItems}
              startIndex={ITEMS_PER_FIRST_PAGE}
              grandTotal={grandTotal}
              showGrandTotal
              marginTop={12}
            />
            <FooterArea />
          </PageFrame>
        )}
      </div>
    </main>
  );
}

export default PreviewPanel;
