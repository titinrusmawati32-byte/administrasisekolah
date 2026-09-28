import React, { useEffect, useState } from 'react';
import { DownloadCloud, Calendar, User, FileText } from 'lucide-react';
import { getAllDownloadRecords } from '../../services/documentService';
import { DownloadRecord } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SearchBar } from '../../components/common/SearchBar';

export const AdminDownloadStats: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllDownloadRecords();
      setDownloads(data);
    } catch (err) {
      console.error('Error fetching download records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDownloads = downloads.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.documentTitle.toLowerCase().includes(q) ||
      d.userName.toLowerCase().includes(q) ||
      d.fileName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Riwayat & Statistik Download Dokumen</h1>
        <p className="text-xs text-slate-500 mt-1">
          Daftar lengkap guru dan pengguna yang mengunduh dokumen dari pusat administrasi.
        </p>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Cari berdasarkan nama guru, judul dokumen, atau nama file..."
      />

      {loading ? (
        <LoadingSpinner label="Memuat riwayat unduhan..." />
      ) : filteredDownloads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          Belum ada riwayat unduhan yang cocok dengan pencarian.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile Card List (< 768px) */}
          <div className="block md:hidden space-y-2.5">
            {filteredDownloads.map((dl) => (
              <div
                key={dl.downloadId}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(dl.downloadedAt).toLocaleString('id-ID')}</span>
                  <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Unduhan</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{dl.documentTitle}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{dl.fileName}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-700">{dl.userName}</span>
                  <span className="text-slate-400 truncate">({dl.userEmail})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/Tablet Table (>= 768px) */}
          <div className="hidden md:block bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Waktu Unduh</th>
                    <th className="py-3 px-4">Nama Guru</th>
                    <th className="py-3 px-4">Judul Dokumen</th>
                    <th className="py-3 px-4">Nama File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredDownloads.map((dl) => (
                    <tr key={dl.downloadId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(dl.downloadedAt).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {dl.userName}
                        <span className="block text-[10px] font-normal text-slate-400">{dl.userEmail}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-600 truncate max-w-xs">
                        {dl.documentTitle}
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                        {dl.fileName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
