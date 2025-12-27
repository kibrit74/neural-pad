/**
 * Contact Export Utility
 * Exports contacts to VCard 3.0 format for phone/device import
 */

export interface ContactData {
    name?: string;
    phone?: string;
    email?: string;
    organization?: string;
    note?: string;
}

/**
 * Escape special characters for VCard format
 */
const escapeVCard = (str: string): string => {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
};

/**
 * Generate VCard 3.0 format string for a single contact
 */
export const generateVCard = (contact: ContactData): string => {
    const lines: string[] = [
        'BEGIN:VCARD',
        'VERSION:3.0',
    ];

    // Full name
    if (contact.name) {
        lines.push(`FN:${escapeVCard(contact.name)}`);
        lines.push(`N:${escapeVCard(contact.name)};;;;`);
    } else if (contact.email) {
        // Use email local part as name if no name provided
        const localPart = contact.email.split('@')[0];
        lines.push(`FN:${escapeVCard(localPart)}`);
        lines.push(`N:${escapeVCard(localPart)};;;;`);
    } else if (contact.phone) {
        lines.push(`FN:${escapeVCard(contact.phone)}`);
        lines.push(`N:${escapeVCard(contact.phone)};;;;`);
    }

    // Phone
    if (contact.phone) {
        const cleanPhone = contact.phone.replace(/\s/g, '');
        lines.push(`TEL;TYPE=CELL:${cleanPhone}`);
    }

    // Email
    if (contact.email) {
        lines.push(`EMAIL;TYPE=INTERNET:${contact.email}`);
    }

    // Organization
    if (contact.organization) {
        lines.push(`ORG:${escapeVCard(contact.organization)}`);
    }

    // Note
    if (contact.note) {
        lines.push(`NOTE:${escapeVCard(contact.note)}`);
    }

    lines.push('END:VCARD');

    return lines.join('\r\n');
};

/**
 * Generate VCard file for multiple contacts
 */
export const generateVCardMultiple = (contacts: ContactData[]): string => {
    return contacts.map(c => generateVCard(c)).join('\r\n');
};

/**
 * Download a single contact as VCard file
 */
export const downloadVCard = (contact: ContactData, filename?: string): void => {
    const vcard = generateVCard(contact);
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const safeName = (contact.name || contact.email || contact.phone || 'contact')
        .replace(/[^a-z0-9-_]+/gi, '_');
    const finalFilename = filename || `${safeName}.vcf`;

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Download multiple contacts as a single VCard file
 */
export const downloadVCardMultiple = (contacts: ContactData[], filename: string = 'contacts.vcf'): void => {
    const vcard = generateVCardMultiple(contacts);
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
