
import { Gorev, Etkinlik, Personel } from './types';

export const fetchGorevler = async (userId?: string): Promise<Gorev[]> => {
    const params = new URLSearchParams();
    if (userId && userId !== 'all') params.append('userId', userId);

    const res = await fetch(`/api/gorev?${params.toString()}`);
    if (!res.ok) throw new Error('Görevler yüklenemedi');

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Görevler alınamadı');

    return data.data;
};

export const fetchEtkinlikler = async (viewDate: Date, userId?: string): Promise<Etkinlik[]> => {
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59);

    let url = `/api/takvim?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`;
    if (userId && userId !== 'all') url += `&userId=${userId}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Etkinlikler yüklenemedi');

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Etkinlikler alınamadı');

    return data.data;
};

export const fetchPersoneller = async (): Promise<Personel[]> => {
    const res = await fetch('/api/personel?limit=100');
    if (!res.ok) throw new Error('Personeller yüklenemedi');

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Personeller alınamadı');

    return data.data;
};

export const createGorev = async (gorevData: any) => {
    const res = await fetch('/api/gorev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gorevData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Görev oluşturulamadı');
    return data;
};

export const createEtkinlik = async (etkinlikData: any) => {
    const res = await fetch('/api/takvim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(etkinlikData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Etkinlik oluşturulamadı');
    return data;
};

export const updateEtkinlik = async ({ id, payload }: { id: string; payload: any }) => {
    const res = await fetch(`/api/takvim/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Etkinlik güncellenemedi');
    return data;
};

export const cancelEtkinlik = async (etkinlikId: string) => {
    const res = await fetch(`/api/takvim/${etkinlikId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Etkinlik iptal edilemedi');
    return data;
};

export const updateGorev = async ({ id, payload }: { id: string; payload: any }) => {
    const res = await fetch(`/api/gorev/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Görev güncellenemedi');
    return data;
};
