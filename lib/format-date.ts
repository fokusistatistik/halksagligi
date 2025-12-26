import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
        return format(new Date(dateString), 'dd.MM.yyyy', { locale: tr });
    } catch (error) {
        return dateString;
    }
};

export const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
        return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: tr });
    } catch (error) {
        return dateString;
    }
};

export const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
        return format(new Date(dateString), 'HH:mm', { locale: tr });
    } catch (error) {
        return dateString;
    }
};
