import React, { useEffect, useState } from 'react';
import { Megaphone, Calendar } from 'lucide-react';
import { getActiveAnnouncements } from '../../services/announcementService';
import { Announcement } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export const GuruAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveAnnouncements().then((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingSpinner label="Memuat pengumuman sekolah..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Pengumuman Sekolah</h1>
        <p className="text-xs text-slate-500 mt-1">
          Informasi penting dan edaran resmi dari pihak administrator dan kepala sekolah.
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Tidak Ada Pengumuman Aktif</h3>
          <p className="text-xs text-slate-400">Belum ada pengumuman baru dari sekolah.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.announcementId}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{ann.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    Oleh {ann.createdByName} • {formatDate(ann.createdAt)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
