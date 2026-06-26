import jsPDF from 'jspdf';
import { ITEMS_PER_FIRST_PAGE } from '../constants/defaults';
import {
  INFO_LABEL_WIDTH_LEFT_MM,
  INFO_LABEL_WIDTH_RIGHT_MM,
  INFO_LEFT_X_MM,
  INFO_LINE_HEIGHT_MM,
  INFO_RIGHT_X_MM,
  INFO_VALUE_WIDTH_LEFT_MM,
  INFO_VALUE_WIDTH_RIGHT_MM,
} from '../constants/infoLayout';
import {
  PDF_MARGIN_MM,
  TABLE_COLUMN_WIDTHS_MM,
  TABLE_HEADERS,
  TABLE_WIDTH_MM,
} from '../constants/tableLayout';
import { buildNoEstimasi, formatDateID } from './formatters';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  const num = Number(value) || 0;
  return `Rp ${currencyFormatter.format(num)}`;
}

async function loadImageAsBase64(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Gagal memuat logo.');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function getImageDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.onerror = () => reject(new Error('Gagal membaca dimensi logo.'));
    img.src = dataUrl;
  });
}

const TABLE_X = PDF_MARGIN_MM;
const TABLE_WIDTHS = TABLE_COLUMN_WIDTHS_MM;
const CELL_PADDING_X = 3;
const LINE_HEIGHT = 3.4;

function getTextPadding(widthMm) {
  return Math.max(widthMm - CELL_PADDING_X * 2, 4);
}

function splitCellText(doc, text, widthMm) {
  return doc.splitTextToSize(String(text ?? ''), getTextPadding(widthMm));
}

function drawWrappedText(doc, lines, x, y, widthMm, align) {
  if (!lines.length || (lines.length === 1 && lines[0] === '')) return;
  const textBlockHeight = lines.length * LINE_HEIGHT;
  const startY = y - textBlockHeight / 2 + LINE_HEIGHT * 0.85;

  if (align === 'right') {
    doc.text(lines, x + widthMm - CELL_PADDING_X, startY, { align: 'right' });
  } else if (align === 'center') {
    doc.text(lines, x + widthMm / 2, startY, { align: 'center' });
  } else {
    doc.text(lines, x + CELL_PADDING_X, startY);
  }
}

function drawInfoField(doc, x, labelWidth, valueWidth, label, value, y) {
  const colonX = x + labelWidth + 1;
  const valueX = x + labelWidth + 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(85, 85, 85);
  doc.text(label, x, y);
  doc.text(':', colonX, y);

  const valueLines = splitCellText(doc, value, valueWidth);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  if (valueLines.length > 0 && valueLines[0] !== '') {
    doc.text(valueLines, valueX, y);
  }
}

function drawInfoSection(doc, header, yStart) {
  const noEstimasi = buildNoEstimasi(header.kodeCabang, header.tanggal, header.noPolisi);

  const rows = [
    { left: ['No Estimasi', noEstimasi], right: ['Jenis Kendaraan/Tipe', header.jenisKendaraan] },
    { left: ['Tanggal', formatDateID(header.tanggal)], right: ['No. Polisi', header.noPolisi] },
    { left: ['Nama Pelanggan', header.namaPelanggan], right: ['Kilometer (KM)', header.kilometer] },
  ];

  let y = yStart;
  rows.forEach(({ left, right }) => {
    const leftValueLines = splitCellText(doc, left[1], INFO_VALUE_WIDTH_LEFT_MM);
    const rightValueLines = splitCellText(doc, right[1], INFO_VALUE_WIDTH_RIGHT_MM);
    const rowLines = Math.max(leftValueLines.length, rightValueLines.length, 1);
    const rowHeight = Math.max(6, rowLines * INFO_LINE_HEIGHT_MM + 1);

    drawInfoField(doc, INFO_LEFT_X_MM, INFO_LABEL_WIDTH_LEFT_MM, INFO_VALUE_WIDTH_LEFT_MM, left[0], left[1], y);
    drawInfoField(doc, INFO_RIGHT_X_MM, INFO_LABEL_WIDTH_RIGHT_MM, INFO_VALUE_WIDTH_RIGHT_MM, right[0], right[1], y);
    y += rowHeight;
  });

  return y;
}

function drawTableHeader(doc, yStart) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.15);

  const headerLines = TABLE_HEADERS.map((header, colIdx) => {
    const w = TABLE_WIDTHS[colIdx];
    const explicit = header.split('\n');
    if (explicit.length > 1) return explicit;
    return splitCellText(doc, header, w);
  });
  const maxHeaderLines = Math.max(...headerLines.map((lines) => lines.length), 1);
  const headerHeight = Math.max(11, maxHeaderLines * LINE_HEIGHT + 3.2);

  let headerX = TABLE_X;
  TABLE_HEADERS.forEach((header, colIdx) => {
    const w = TABLE_WIDTHS[colIdx];
    doc.setFillColor(224, 224, 224);
    doc.rect(headerX, yStart, w, headerHeight, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.rect(headerX, yStart, w, headerHeight, 'S');
    doc.setTextColor(0, 0, 0);
    drawWrappedText(doc, headerLines[colIdx], headerX, yStart + headerHeight / 2, w, 'center');
    headerX += w;
  });

  return yStart + headerHeight;
}

function drawItemRows(doc, items, yStart, startIndex) {
  const defaultRowHeight = 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.15);
  doc.setFillColor(255, 255, 255);

  let y = yStart;
  items.forEach((item, rowIdx) => {
    const numberText = item ? String(startIndex + rowIdx + 1) : '';
    const descLines = item?.deskripsi ? splitCellText(doc, item.deskripsi, TABLE_WIDTHS[1]) : [''];
    const qtyLines = item ? splitCellText(doc, item.qty, TABLE_WIDTHS[2]) : [''];
    const hargaText = item && item.hargaSatuan !== '' && item.hargaSatuan !== undefined ? formatCurrency(item.hargaSatuan) : '';
    const totalText = item && item.totalHarga !== '' && item.totalHarga !== undefined ? formatCurrency(item.totalHarga) : '';
    const hargaLines = hargaText ? splitCellText(doc, hargaText, TABLE_WIDTHS[3]) : [''];
    const totalLines = totalText ? splitCellText(doc, totalText, TABLE_WIDTHS[4]) : [''];
    const garansiLines = item ? splitCellText(doc, item.garansi, TABLE_WIDTHS[5]) : [''];
    const numberLines = numberText ? splitCellText(doc, numberText, TABLE_WIDTHS[0]) : [''];

    const maxLines = Math.max(numberLines.length, descLines.length, qtyLines.length, hargaLines.length, totalLines.length, garansiLines.length, 1);
    const rowHeight = Math.max(defaultRowHeight, maxLines * LINE_HEIGHT + 2.8);

    let rowX = TABLE_X;
    TABLE_WIDTHS.forEach((w) => {
      doc.rect(rowX, y, w, rowHeight, 'S');
      rowX += w;
    });

    if (item) {
      const yMid = y + rowHeight / 2;
      let colX = TABLE_X;
      drawWrappedText(doc, numberLines, colX, yMid, TABLE_WIDTHS[0], 'center');
      colX += TABLE_WIDTHS[0];
      drawWrappedText(doc, descLines, colX, yMid, TABLE_WIDTHS[1], 'left');
      colX += TABLE_WIDTHS[1];
      drawWrappedText(doc, qtyLines, colX, yMid, TABLE_WIDTHS[2], 'center');
      colX += TABLE_WIDTHS[2];
      drawWrappedText(doc, hargaLines, colX, yMid, TABLE_WIDTHS[3], 'right');
      colX += TABLE_WIDTHS[3];
      drawWrappedText(doc, totalLines, colX, yMid, TABLE_WIDTHS[4], 'right');
      colX += TABLE_WIDTHS[4];
      drawWrappedText(doc, garansiLines, colX, yMid, TABLE_WIDTHS[5], 'center');
    }

    y += rowHeight;
  });

  return y;
}

function drawGrandTotal(doc, total, yStart) {
  const mergedWidth = TABLE_WIDTHS[0] + TABLE_WIDTHS[1] + TABLE_WIDTHS[2];
  const hargaWidth = TABLE_WIDTHS[3];
  const totalWidth = TABLE_WIDTHS[4];
  const garansiWidth = TABLE_WIDTHS[5];
  const totalLines = total > 0 ? splitCellText(doc, formatCurrency(total), totalWidth) : [''];
  const totalHeight = Math.max(9, totalLines.length * LINE_HEIGHT + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setFillColor(224, 224, 224);
  doc.rect(TABLE_X, yStart, mergedWidth, totalHeight, 'F');
  doc.rect(TABLE_X + mergedWidth, yStart, hargaWidth, totalHeight, 'F');
  doc.rect(TABLE_X + mergedWidth + hargaWidth, yStart, totalWidth, totalHeight, 'F');
  doc.rect(TABLE_X + mergedWidth + hargaWidth + totalWidth, yStart, garansiWidth, totalHeight, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.rect(TABLE_X, yStart, mergedWidth, totalHeight, 'S');
  doc.rect(TABLE_X + mergedWidth, yStart, hargaWidth, totalHeight, 'S');
  doc.rect(TABLE_X + mergedWidth + hargaWidth, yStart, totalWidth, totalHeight, 'S');
  doc.rect(TABLE_X + mergedWidth + hargaWidth + totalWidth, yStart, garansiWidth, totalHeight, 'S');

  doc.setTextColor(0, 0, 0);
  doc.text('Grand Total', TABLE_X + mergedWidth / 2, yStart + totalHeight / 2 + 1, { align: 'center' });
  if (total > 0) {
    drawWrappedText(doc, totalLines, TABLE_X + mergedWidth + hargaWidth, yStart + totalHeight / 2, totalWidth, 'right');
  }

  return yStart + totalHeight;
}

function drawNoteBox(doc, yStart) {
  const x = PDF_MARGIN_MM;
  const width = TABLE_WIDTH_MM;
  const lineHeight = 4;
  const text = [
    'Notes:',
    '- Pihak Dokter Mobil tidak pernah melakukan penggantian sparepart maupun jasa servis tanpa persetujuan pemilik mobil.',
    '- Form estimasi harga ini hanya sah apabila dicetak oleh Dokter Mobil. Segala perubahan, penambahan, koreksi, atau keterangan yang ditulis tangan dianggap tidak berlaku.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const wrapped1 = doc.splitTextToSize(text[1], width - 6);
  const wrapped2 = doc.splitTextToSize(text[2], width - 6);
  const height = 8 + (wrapped1.length + wrapped2.length + 1) * lineHeight;

  doc.setDrawColor(51, 51, 51);
  doc.setLineWidth(0.18);
  doc.rect(x, yStart, width, height);
  doc.setFont('helvetica', 'bold');
  doc.text(text[0], x + 3, yStart + 4.8);
  doc.setFont('helvetica', 'normal');
  doc.text(wrapped1, x + 3, yStart + 9);
  doc.text(wrapped2, x + 3, yStart + 9 + wrapped1.length * lineHeight);

  return yStart + height;
}

function drawSignatures(doc, yStart) {
  const x = PDF_MARGIN_MM;
  const totalWidth = TABLE_WIDTH_MM;
  const colWidth = totalWidth / 3;
  const lineWidth = colWidth * 0.8;
  const signatureSpace = 25;
  const labels = [['Mengetahui Estimasi Harga'], ['Mengetahui Estimasi Harga'], ['Menyetujui Pengerjaan']];
  const names = ['Supervisor', 'Customer', 'Customer'];

  doc.setFontSize(8);
  labels.forEach((labelLines, idx) => {
    const colX = x + idx * colWidth;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    labelLines.forEach((line, lineIdx) => {
      doc.text(line, colX + colWidth / 2, yStart + 4 + lineIdx * 4, { align: 'center' });
    });

    const lineY = yStart + signatureSpace + 8;
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(colX + (colWidth - lineWidth) / 2, lineY, colX + (colWidth + lineWidth) / 2, lineY);
    doc.setFont('helvetica', 'bold');
    doc.text(names[idx], colX + colWidth / 2, lineY + 4, { align: 'center' });
  });

  return yStart + signatureSpace + 8 + 6;
}

function drawWatermarkGrid(doc, logoBase64, naturalWidth, naturalHeight) {
  const wmWidth = 45;
  const wmHeight = (naturalHeight / naturalWidth) * wmWidth;
  const colsX = [15, 80, 145];
  const rowsY = [30, 90, 150, 210, 262];

  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.05 }));
  rowsY.forEach((y, rowIdx) => {
    const stagger = rowIdx % 2 === 1 ? 32 : 0;
    colsX.forEach((x) => {
      doc.addImage(logoBase64, 'PNG', x + stagger, y, wmWidth, wmHeight, '', 'FAST', -30);
    });
  });
  doc.restoreGraphicsState();
}

function drawPageFooters(doc) {
  const total = doc.getNumberOfPages();
  if (total < 2) return;
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(85, 85, 85);
    doc.text(`Halaman ${i} / ${total}`, 195, 290, { align: 'right' });
  }
}

function drawPage1Title(doc) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text('ESTIMASI HARGA', 105, 40, { align: 'center' });
  doc.text('ESTIMASI HARGA', 105.25, 40, { align: 'center' });
}

function drawPage2Title(doc, header) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const noEst = buildNoEstimasi(header.kodeCabang, header.tanggal, header.noPolisi);
  const text = `ESTIMASI HARGA — Lanjutan${noEst ? ` (${noEst})` : ''}`;
  doc.text(text, 105, 22, { align: 'center' });
}

export async function generatePDF(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const logo = await loadImageAsBase64('/logo-dokter-mobil-pasti-beres.png');
  const { width: logoW, height: logoH } = await getImageDimensions(logo);
  const boxX = PDF_MARGIN_MM;
  const boxY = PDF_MARGIN_MM;
  const boxW = 32;
  const boxH = 12;
  const ratio = logoW / logoH;

  let drawW = boxW;
  let drawH = drawW / ratio;
  if (drawH > boxH) {
    drawH = boxH;
    drawW = drawH * ratio;
  }

  const drawX = boxX + (boxW - drawW) / 2;
  const drawY = boxY + (boxH - drawH) / 2;
  drawWatermarkGrid(doc, logo, logoW, logoH);
  doc.addImage(logo, 'PNG', drawX, drawY, drawW, drawH);
  drawPage1Title(doc);

  const infoEndY = drawInfoSection(doc, data.header, 52);

  const filledItems = data.items.filter(
    (item) => String(item.deskripsi).trim() !== '' || item.qty !== '' || item.hargaSatuan !== '',
  );

  const grandTotal = filledItems.reduce((sum, item) => sum + (Number(item.totalHarga) || 0), 0);

  const firstPageItems = filledItems.slice(0, ITEMS_PER_FIRST_PAGE);
  const secondPageItems = filledItems.slice(ITEMS_PER_FIRST_PAGE);

  let tableHeaderEndY = drawTableHeader(doc, infoEndY + 12);
  let lastRowsY = drawItemRows(doc, firstPageItems, tableHeaderEndY, 0);

  if (secondPageItems.length === 0) {
    const afterTotalY = drawGrandTotal(doc, grandTotal, lastRowsY);
    const afterSigY = drawSignatures(doc, afterTotalY + 10);
    drawNoteBox(doc, afterSigY + 6);
  } else {
    doc.addPage();
    drawWatermarkGrid(doc, logo, logoW, logoH);
    drawPage2Title(doc, data.header);
    tableHeaderEndY = drawTableHeader(doc, 32);
    lastRowsY = drawItemRows(doc, secondPageItems, tableHeaderEndY, ITEMS_PER_FIRST_PAGE);
    const afterTotalY = drawGrandTotal(doc, grandTotal, lastRowsY);
    const afterSigY = drawSignatures(doc, afterTotalY + 10);
    drawNoteBox(doc, afterSigY + 6);
  }

  drawPageFooters(doc);

  const safeName = (data.header.namaPelanggan || 'Customer').replace(/[^\w\s-]/g, '').trim() || 'Customer';
  const safeDate = data.header.tanggal || new Date().toISOString().split('T')[0];
  doc.save(`Estimasi_${safeName}_${safeDate}.pdf`);
}
