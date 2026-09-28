import React, { useEffect, useState } from 'react';
import { Download, Activity, Clock, User, FileText } from 'lucide-react';
import { getActivityLogs, exportActivityLogsToCSV } from '../../services/activityService';
import { ActivityLog } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SearchBar } from '../../components/common/SearchBar';

export const AdminActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getActivityLogs(300);
      setLogs(data);
    } catch (err) {
      console.error('Error getting activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExportCSV = () => {
    exportActivityLogsToCSV(logs);
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchUser = log.userName.toLowerCase().includes(q) || log.userEmail.toLowerCase().includes(q);
    const matchAction = log.action.toLowerCase().includes(q);
    const matchDoc = (log.documentName || '').toLowerCase().includes(q);
    return matchUser || matchAction || matchDoc;
  });

  const getActionBadge = (action: ActivityLog['action']) => {
    const styles = {
      LOGIN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      LOGOUT: 'bg-slate-100 text-slate-700 border-slate-200',
      UPLOAD_DOC: 'bg-blue-50 text-blue-700 border-blue-200',
      EDIT_DOC: 'bg-amber-50 text-amber-700 border-amber-200',
      DELETE_DOC: 'bg-rose-50 text-rose-700 border-rose-200',
      DOWNLOAD_DOC: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      UPDATE_PROFILE: 'bg-purple-50 text-purple-700 border-purple-200',
      UPDATE_SETTINGS: 'bg-sky-50 text-sky-700 border-sky-200',
      CREATE_CATEGORY: 'bg-teal-50 text-teal-700 border-teal-200',
      CREATE_USER: 'bg-pink-50 text-pink-700 border-pink-200'
    };

    return (
      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${styles[action] || 'bg-slate-100 text-slate-700'}`}>
        {action.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Audit Trail & Log Aktivitas Sistem</h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak seluruh tindakan login, pengunggahan, pembaruan, dan unduhan dokumen di sekolah.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={logs.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-colors disabled:opacity-50 shrink-0"
        >
          <Download className="w-4 h-4" />
          Ekspor Log ke CSV
        </button>
      </div>

      {/* Controls */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Cari berdasarkan nama pengguna, email, aksi, atau dokumen..."
      />

      {/* Table */}
      {loading ? (
        <LoadingSpinner label="Memuat rekam aktivitas..." />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Aksi / Tindakan</th>
                  <th className="py-3 px-4">Dokumen / Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredLogs.map((l) => (
                  <tr key={l.activityId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(l.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {l.userName}
                      <span className="block text-[10px] font-normal text-slate-400">{l.userEmail}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(l.action)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                      {l.documentName || '-'}
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
