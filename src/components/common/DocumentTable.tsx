import React from 'react';
import { Eye, Download, Calendar, ArrowUpDown } from 'lucide-react';
import { SchoolDocument } from '../../types';
import { FileIcon, getFileTypeBadgeColor } from './FileIcon';
import { formatBytes, formatDateShort } from '../../utils/formatters';

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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
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
              const badgeStyle = getFileTypeBadgeColor(doc.fileType);
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
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview Dokumen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDownload(doc)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Download Dokumen"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <>
                          {onEdit && (
                            <button
                              onClick={() => onEdit(doc)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              ✏️
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(doc)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              🗑️
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
  );
};
