export const PDF_MARGIN_MM = 15;
export const TABLE_COLUMN_WIDTHS_MM = [10, 70, 12, 32, 32, 24];
export const TABLE_WIDTH_MM = TABLE_COLUMN_WIDTHS_MM.reduce((sum, w) => sum + w, 0);

export const TABLE_HEADERS = [
  'No',
  'Deskripsi Pekerjaan / Part',
  'Qty',
  'Harga Satuan\ninc PPN',
  'Total Harga\ninc PPN',
  'Garansi/\nBonus',
];
