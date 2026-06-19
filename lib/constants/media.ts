export type MediaType = 'image' | 'video' | 'audio' | 'pdf' | 'document';

export interface MediaItem {
    id: string;
    type: MediaType;
    title: string;
    title_vi?: string;
    description: string;
    description_vi?: string;
    url: string;
    thumbnail_url?: string;
    event_id?: string;
    category?: string | null;
    tags: string[];
    file_size?: number;
    duration?: number;
    created_at: string;
    year: number;
}

export const MEDIA_CATEGORIES = [
    'Festival',
    'Architecture',
    'Community',
    'Meditation',
    'Education',
    'Charity',
    'Culture',
    'Branch Activities',
];

export const MEDIA_TYPES: { value: MediaType; label: string; icon: string }[] = [
    { value: 'image', label: 'Image', icon: 'Image' },
    { value: 'video', label: 'Video', icon: 'Video' },
    { value: 'audio', label: 'Audio', icon: 'Music' },
    { value: 'pdf', label: 'Document', icon: 'FileText' },
];

export const AVAILABLE_YEARS = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => 2020 + i
);

export const COMMON_TAGS = [
    'Festival',
    'Assembly',
    'Charity',
    'Education',
    'Architecture',
    'Community',
    'Culture',
    'Meditation',
];

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
        /youtube\.com\/embed\/([^?]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}
