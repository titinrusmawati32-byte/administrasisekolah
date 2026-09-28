import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Category, DocumentStatus } from '../../types';

export interface FilterOptions {
  categoryId: string;
  year: string;
  semester: string;
  fileType: string;
  status?: string;
}

interface DocumentFilterProps {
  categories: Category[];
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  showStatusFilter?: boolean;
}

export const DocumentFilter: React.FC<DocumentFilterProps> = ({
  categories,
  filters,
  onChange,
  showStatusFilter = false
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const handleReset = () => {
    onChange({
      categoryId: '',
      year: '',
      semester: '',
      fileType: '',
      status: ''
    });
  };

  const hasActiveFilters = Boolean(
    filters.categoryId || filters.year || filters.semester || filters.fileType || filters.status
  );

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          Filter Dokumen
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Category */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Kategori</label>
          <select
            value={filters.categoryId}
            onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tahun</label>
          <select
            value={filters.year}
            onChange={(e) => onChange({ ...filters, year: e.target.value })}
            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white"
          >
            <option value="">Semua Tahun</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Semester</label>
          <select
            value={filters.semester}
            onChange={(e) => onChange({ ...filters, semester: e.target.value })}
            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white"
          >
            <option value="">Semua Semester</option>
            <option value="1">Semester 1 (Ganjil)</option>
            <option value="2">Semester 2 (Genap)</option>
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>

        {/* File Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Format File</label>
          <select
            value={filters.fileType}
            onChange={(e) => onChange({ ...filters, fileType: e.target.value })}
            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white"
          >
            <option value="">Semua Format</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word (.docx)</option>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="pptx">PowerPoint (.pptx)</option>
            <option value="jpg">Gambar (JPG/PNG)</option>
            <option value="zip">Arsip (ZIP/RAR)</option>
          </select>
        </div>

        {/* Status (Admin Only) */}
        {showStatusFilter && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status Dokumen</label>
            <select
              value={filters.status || ''}
              onChange={(e) => onChange({ ...filters, status: e.target.value })}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white"
            >
              <option value="">Semua Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
