/**
 * Empty State Components
 * Shows when there's no data to display
 */

import { FileX, Search, Inbox, AlertCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 mb-4 text-gray-400">
        {icon || <Inbox className="w-full h-full" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-4 max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function NoDataFound() {
  return (
    <EmptyState
      icon={<FileX className="w-full h-full" />}
      title="Veri Bulunamadı"
      description="Aradığınız kriterlere uygun kayıt bulunamadı."
    />
  );
}

export function NoSearchResults() {
  return (
    <EmptyState
      icon={<Search className="w-full h-full" />}
      title="Sonuç Bulunamadı"
      description="Aramanızla eşleşen sonuç bulunamadı. Farklı arama terimleri deneyin."
    />
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-full h-full text-red-500" />}
      title="Bir Hata Oluştu"
      description={message || "Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin."}
    />
  );
}
