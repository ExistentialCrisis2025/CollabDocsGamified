export type Quest = {
    id: number;
    title: string;
    description: string;
    bonus_xp: number;
    current_progress: number;
    target_value: number;
    status: 'active' | 'completed' | 'expired';
};