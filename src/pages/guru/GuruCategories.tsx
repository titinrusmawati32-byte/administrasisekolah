import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, ArrowRight } from 'lucide-react';
import { getCategories } from '../../services/categoryService';
import { getPublishedDocuments } from '../../services/documentService';
import { Category } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const GuruCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [docCounts, setDocCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getCategories(), getPublishedDocuments()]).then(([cats, docs]) => {
      const counts: Record<string, number> = {};
      docs.forEach((d) => {
        counts[d.categoryId] = (counts[d.categoryId] || 0) + 1;
      });
      setCategories(cats);
      setDocCounts(counts);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingSpinner label="Memuat kategori..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Kategori Dokumen Administrasi</h1>
        <p className="text-xs text-slate-500 mt-1">
          Pilih kelompok kategori untuk menyaring dokumen yang relevan dengan tugas mengajar Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.categoryId}
            onClick={() => navigate(`/guru/documents?category=${cat.categoryId}`)}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Folder className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                  {docCounts[cat.categoryId] || 0} Berkas
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description || 'Tidak ada deskripsi.'}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Buka Dokumen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
