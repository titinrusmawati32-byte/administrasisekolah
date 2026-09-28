import React from 'react';
import { Download, Eye, Calendar, FileText, DownloadCloud } from 'lucide-react';
import { SchoolDocument } from '../../types';
import { FileIcon, getFileTypeBadgeColor } from './FileIcon';
import { formatBytes, formatDate } from '../../utils/formatters';

interface DocumentCardProps {
  doc: SchoolDocument;
  onPreview: (doc: SchoolDocument) => void;
  onDownload: (doc: SchoolDocument) => void;
  onEdit?: (doc: SchoolDocument) => void;
  onDelete?: (doc: SchoolDocument) => void;
  isAdmin?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
  isAdmin = false
}) => {
  const badgeStyle = getFileTypeBadgeColor(doc.fileType);

  const statusColors = {
    Published: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Draft: 'bg-amber-100 text-amber-800 border-amber-200',
    Archived: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5 space-y-3">
        {/* Top Header info */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl group-hover:scale-105 transition-transform">
              <FileIcon fileType={doc.fileType} className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                {doc.fileType || 'FILE'}
              </span>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                {doc.categoryName || 'Administrasi'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                statusColors[doc.status] || statusColors.Published
              }`}
            >
              {doc.status}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {doc.title}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {doc.description || 'Tidak ada deskripsi tambahan.'}
          </p>
        </div>

        {/* Metadata info */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Thn {doc.year} (Sem {doc.semester})</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatBytes(doc.fileSize)}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600 ml-auto">
            <DownloadCloud className="w-3.5 h-3.5" />
            <span className="font-semibold">{doc.downloadCount || 0}x</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-slate-50/80 px-3.5 sm:px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onPreview(doc)}
          className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          Preview
        </button>

        <button
          type="button"
          onClick={() => onDownload(doc)}
          className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs shadow-blue-200 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Unduh
        </button>

        {isAdmin && (onEdit || onDelete) && (
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(doc)}
                className="min-h-[38px] min-w-[38px] p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-xl transition-colors text-xs flex items-center justify-center cursor-pointer"
                title="Edit Dokumen"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(doc)}
                className="min-h-[38px] min-w-[38px] p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition-colors text-xs flex items-center justify-center cursor-pointer"
                title="Hapus Dokumen"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
