import React from 'react';
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Archive,
  File
} from 'lucide-react';

interface FileIconProps {
  fileType: string;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ fileType, className = 'w-8 h-8' }) => {
  const ext = (fileType || '').toLowerCase().replace('.', '');

  if (ext === 'pdf') {
    return <FileText className={`${className} text-red-600 dark:text-red-400`} />;
  }
  if (['doc', 'docx'].includes(ext)) {
    return <FileText className={`${className} text-blue-600 dark:text-blue-400`} />;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet className={`${className} text-emerald-600 dark:text-emerald-400`} />;
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return <Presentation className={`${className} text-amber-600 dark:text-amber-400`} />;
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    return <ImageIcon className={`${className} text-purple-600 dark:text-purple-400`} />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <Archive className={`${className} text-stone-600 dark:text-stone-400`} />;
  }

  return <File className={`${className} text-slate-500`} />;
};

export function getFileTypeBadgeColor(fileType: string): string {
  const ext = (fileType || '').toLowerCase().replace('.', '');
  if (ext === 'pdf') return 'bg-red-50 text-red-700 border-red-200';
  if (['doc', 'docx'].includes(ext)) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (['xls', 'xlsx'].includes(ext)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (['ppt', 'pptx'].includes(ext)) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (['jpg', 'jpeg', 'png'].includes(ext)) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (['zip', 'rar'].includes(ext)) return 'bg-stone-100 text-stone-700 border-stone-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}
