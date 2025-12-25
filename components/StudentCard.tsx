'use client';

import { useDraggable } from '@dnd-kit/core';
import { useState } from 'react';

interface Student {
    id: string;
    email: string;
    name?: string | null;
    roll_number?: string | null;
    department: string;
    year: number;
    group?: {
        id: string;
        name: string;
        color: string;
    } | null;
}

interface StudentCardProps {
    student: Student;
    isDragging?: boolean;
    userRole?: 'execom' | 'chairman';
    onDelete?: (studentId: string) => void;
    showDeleteButton?: boolean;
}

export function StudentCard({
    student,
    isDragging,
    userRole = 'execom',
    onDelete,
    showDeleteButton = false
}: StudentCardProps) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: student.id,
        data: { student }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const displayName = student.name || student.email;
    const displaySubtitle = [
        student.roll_number,
        `Year ${student.year}`,
        student.department
    ].filter(Boolean).join(' • ');

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowConfirmDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(student.id);
            setShowConfirmDialog(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const canDelete = showDeleteButton && onDelete;

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                className={`flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing group ${isDragging ? 'opacity-50 scale-95' : ''
                    }`}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{
                            background: student.group?.color
                                ? `linear-gradient(135deg, ${student.group.color}, ${student.group.color}dd)`
                                : 'linear-gradient(135deg, #06b6d4, #a855f7)'
                        }}
                    >
                        {displayName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{displayName}</div>
                        <div className="text-text-secondary text-xs truncate">
                            {displaySubtitle}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {student.group && (
                        <span
                            className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                            style={{
                                backgroundColor: `${student.group.color}20`,
                                color: student.group.color,
                                borderColor: `${student.group.color}40`,
                                borderWidth: '1px'
                            }}
                        >
                            {student.group.name}
                        </span>
                    )}

                    {/* Delete button - only visible for chairman */}
                    {canDelete && (
                        <button
                            onClick={handleDeleteClick}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-red-500/0 hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete student"
                            aria-label={`Delete student ${displayName}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}

                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowConfirmDialog(false)}
                >
                    <div
                        className="glass-card max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-red-400 mb-2">Delete Student</h3>
                                <p className="text-text-secondary">
                                    Are you sure you want to permanently delete <strong className="text-text-primary">{displayName}</strong>?
                                </p>
                                <p className="text-text-secondary text-sm mt-2">
                                    This action cannot be undone. The student will be removed from the system and any group they belong to.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={isDeleting}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="btn bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Deleting...
                                    </span>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Student
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
