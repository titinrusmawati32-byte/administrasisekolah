import React from 'react';
import { Eye, Download, Pencil, Trash2 } from 'lucide-react';
import { SchoolDocument } from '../../types';
import { FileIcon, getFileTypeBadgeColor } from './FileIcon';
import { formatBytes } from '../../utils/formatters';

interface DocumentTableProps {
  documents: SchoolDocument[];
  onPreview: (doc: SchoolDocument) => void;
  onDownload: (doc: SchoolDocument) => void;
  onEdit?: (doc: SchoolDocument) => void;
  onDelete?: (doc: SchoolDocument) => void;
  isAdmin?: boolean;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
  isAdmin = false
}) => {
  return (
    <div className="space-y-3">
      {/* Mobile Card View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.documentId}
            className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-slate-50 rounded-xl shrink-0 border border-slate-100">
                <FileIcon fileType={doc.fileType} className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {doc.categoryName || 'Administrasi'}
                  </span>
                  {isAdmin && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        doc.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : doc.status === 'Draft'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {doc.status}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug">
                  {doc.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {doc.fileName}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <div>
                <span>{doc.year} (Sem {doc.semester})</span> • <span>{formatBytes(doc.fileSize)}</span>
              </div>
              <span className="font-semibold text-blue-600">
                {doc.downloadCount || 0}x unduh
              </span>
            </div>

            {/* Mobile Touch Action Buttons (Comfortable min 40-44px touch) */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onPreview(doc)}
                className="flex-1 min-h-[40px] py-2 px-3 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Lihat</span>
              </button>
              <button
                type="button"
                onClick={() => onDownload(doc)}
                className="flex-1 min-h-[40px] py-2 px-3 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh</span>
              </button>
              {isAdmin && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(doc)}
                  className="min-h-[40px] min-w-[40px] p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  title="Edit Dokumen"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {isAdmin && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(doc)}
                  className="min-h-[40px] min-w-[40px] p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  title="Hapus Dokumen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/Tablet Table View (>= 768px) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Nama Dokumen</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Tahun / Sem</th>
                <th className="py-3 px-4">Ukuran</th>
                <th className="py-3 px-4">Unduhan</th>
                {isAdmin && <th className="py-3 px-4">Status</th>}
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {documents.map((doc) => {
                return (
                  <tr key={doc.documentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg shrink-0 border border-slate-100">
                          <FileIcon fileType={doc.fileType} className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-800 hover:text-blue-600 transition-colors truncate">
                            {doc.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {doc.fileName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {doc.categoryName || 'Administrasi'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {doc.year} (Sem {doc.semester})
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {formatBytes(doc.fileSize)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-600 whitespace-nowrap">
                      {doc.downloadCount || 0}x
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            doc.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : doc.status === 'Draft'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPreview(doc)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Preview Dokumen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDownload(doc)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Download Dokumen"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            {onEdit && (
                              <button
                                onClick={() => onEdit(doc)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(doc)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
