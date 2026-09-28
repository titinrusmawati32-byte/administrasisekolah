import React from 'react';
import { Download, ExternalLink, Calendar, User, FileText, DownloadCloud } from 'lucide-react';
import { SchoolDocument } from '../../types';
import { Modal } from './Modal';
import { FileIcon } from './FileIcon';
import { formatBytes, formatDate } from '../../utils/formatters';

interface DocumentPreviewProps {
  doc: SchoolDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (doc: SchoolDocument) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  doc,
  isOpen,
  onClose,
  onDownload
}) => {
  if (!doc) return null;

  const ext = (doc.fileType || '').toLowerCase().replace('.', '');
  const isPdf = ext === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doc.title}
      subtitle={`Kategori: ${doc.categoryName || 'Administrasi'} • Tahun ${doc.year}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Format / Ukuran</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 font-bold">
              <FileIcon fileType={doc.fileType} className="w-4 h-4" />
              <span>{doc.fileType?.toUpperCase()} ({formatBytes(doc.fileSize)})</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Tahun / Semester</span>
            <span className="text-slate-800 font-bold mt-0.5 block">
              {doc.year} (Semester {doc.semester})
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Diupload Oleh</span>
            <span className="text-slate-800 font-bold mt-0.5 block truncate">
              {doc.uploadedByName || 'Admin Sekolah'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Unduhan</span>
            <span className="text-blue-600 font-bold mt-0.5 block">
              {doc.downloadCount || 0} Kali
            </span>
          </div>
        </div>

        {/* Description */}
        {doc.description && (
          <div>
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi Dokumen
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 border border-slate-100 rounded-xl">
              {doc.description}
            </p>
          </div>
        )}

        {/* Preview Area */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900/5 min-h-[320px] flex items-center justify-center">
          {isPdf && doc.fileUrl ? (
            <iframe
              src={doc.fileUrl}
              className="w-full h-[450px] rounded-2xl border-0"
              title={doc.title}
            />
          ) : isImage && doc.fileUrl ? (
            <div className="p-4 flex flex-col items-center max-h-[450px] overflow-auto">
              <img
                src={doc.fileUrl}
                alt={doc.title}
                className="max-h-[400px] object-contain rounded-xl shadow-md border border-white"
              />
            </div>
          ) : (
            <div className="text-center p-8 max-w-sm">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <FileIcon fileType={doc.fileType} className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                Preview Tidak Tersedia Langsung
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Format file <span className="font-semibold text-slate-700">.{ext.toUpperCase()}</span> memerlukan aplikasi eksternal (seperti Microsoft Word/Excel) atau dapat diunduh langsung untuk dibaca.
              </p>
              <button
                onClick={() => onDownload(doc)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                Unduh Dokumen Sekarang
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            Diupload tanggal {formatDate(doc.uploadedAt)}
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            >
              Tutup
            </button>
            <button
              onClick={() => onDownload(doc)}
              className="flex-1 sm:flex-none min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Unduh File ({doc.fileType?.toUpperCase()})
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
