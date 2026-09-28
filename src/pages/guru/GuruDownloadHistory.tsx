import React, { useEffect, useState } from 'react';
import { DownloadCloud, Calendar, FileText } from 'lucide-react';
import { getUserDownloadHistory } from '../../services/documentService';
import { DownloadRecord } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

import { INITIAL_DOWNLOADS } from '../../services/defaultData';

export const GuruDownloadHistory: React.FC = () => {
  const [history, setHistory] = useState<DownloadRecord[]>(INITIAL_DOWNLOADS);
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      getUserDownloadHistory(currentUser.uid).then((data) => {
        if (data.length > 0) {
          setHistory(data);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner label="Memuat riwayat unduhan..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Riwayat Unduhan Saya</h1>
        <p className="text-xs text-slate-500 mt-1">
          Daftar berkas dokumen administrasi sekolah yang pernah Anda unduh.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <DownloadCloud className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Belum Ada Riwayat Unduhan</h3>
          <p className="text-xs text-slate-400">
            Anda belum pernah mengunduh dokumen dari sistem.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu Unduh</th>
                  <th className="py-3 px-4">Judul Dokumen</th>
                  <th className="py-3 px-4">Nama File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {history.map((item) => (
                  <tr key={item.downloadId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(item.downloadedAt).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {item.documentTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {item.fileName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
