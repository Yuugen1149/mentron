'use client';

import { useState } from 'react';

interface Group {
    id: string;
    name: string;
    department: string;
    year: number | null;
    color: string;
}

interface Student {
    id: string;
    name?: string | null;
    email: string;
}

interface StudentReassignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    currentGroupId: string | null;
    groups: Group[];
    onSuccess: () => void;
}

export function StudentReassignmentModal({
    isOpen,
    onClose,
    student,
    currentGroupId,
    groups,
    onSuccess
}: StudentReassignmentModalProps) {
    const [selectedGroupId, setSelectedGroupId] = useState<string>('unassigned');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleReassign() {
        if (!student) return;

        setLoading(true);
        setError(null);

        const targetGroupId = selectedGroupId === 'unassigned' ? null : selectedGroupId;

        // Don't do anything if no change
        if (targetGroupId === currentGroupId) {
            onClose();
            return;
        }

        try {
            const res = await fetch('/api/students/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentIds: [student.id],
                    groupId: targetGroupId
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to reassign student');
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reassign student');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !student) return null;

    const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-[var(--deep-bg)] border border-[var(--glass-border)] rounded-2xl shadow-2xl overflow-hidden glass-card">
                <div className="p-6 border-b border-[var(--glass-border)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        Reassign Student
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Change group for <span className="font-semibold text-primary-cyan">{student.name || student.email}</span>
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Select New Group
                        </label>
                        <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-[var(--glass-border)] text-[var(--text-primary)] focus:border-primary-cyan focus:outline-none"
                        >
                            <option value="unassigned">Unassigned (No Group)</option>
                            {sortedGroups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name} {group.year ? `(Year ${group.year})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[var(--glass-border)] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReassign}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-primary-cyan hover:bg-primary-cyan/80 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Confirm Reassignment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
