export const formatPhoneNumber = (value: string | undefined | null): string => {
    if (!value) return '-';

    // Sadece rakamları al
    const cleaned = ('' + value).replace(/\D/g, '');

    // Format check: 5354040712 (10 hane)
    if (cleaned.length === 10) {
        const part1 = cleaned.substring(0, 3);
        const part2 = cleaned.substring(3, 6);
        const part3 = cleaned.substring(6, 8);
        const part4 = cleaned.substring(8, 10);
        return `(${part1}) ${part2} ${part3} ${part4}`;
    }

    return value;
};

export const cleanPhoneNumber = (value: string): string => {
    return value.replace(/\D/g, '').substring(0, 10);
};

export const isValidPhoneNumber = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    // Başında 0 olmamalı, 5 ile başlamalı ve 10 hane olmalı
    return cleaned.startsWith('5') && cleaned.length === 10;
};
