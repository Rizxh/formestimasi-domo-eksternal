import { TABLE_COLUMN_WIDTHS_MM, TABLE_WIDTH_MM } from './tableLayout';

export const PREVIEW_PAGE_WIDTH_PX = 595;
export const PREVIEW_PAGE_HEIGHT_PX = 842;
export const PREVIEW_MARGIN_PX = Math.round((15 / 210) * PREVIEW_PAGE_WIDTH_PX);

export const PREVIEW_CONTENT_WIDTH_PX =
  PREVIEW_PAGE_WIDTH_PX - PREVIEW_MARGIN_PX * 2;

export function getPreviewColumnWidthsPx(contentWidthPx = PREVIEW_CONTENT_WIDTH_PX) {
  const widths = TABLE_COLUMN_WIDTHS_MM.map((mm) =>
    Math.floor((mm / TABLE_WIDTH_MM) * contentWidthPx),
  );
  const used = widths.reduce((sum, w) => sum + w, 0);
  widths[widths.length - 1] += contentWidthPx - used;
  return widths;
}
