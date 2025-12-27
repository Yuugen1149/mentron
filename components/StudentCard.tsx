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
    group_id: string | null;
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
    onReassign?: (student: Student) => void;
}

export function StudentCard({
    student,
    isDragging,
    userRole = 'execom',
    onDelete,
    showDeleteButton = false,
    onReassign
}: StudentCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
        setShowDeleteConfirm(true);
    };

    const confirmDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(student.id);
        }
        setShowDeleteConfirm(false);
    };

    const cancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`group flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 scale-95' : ''
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

                {/* Actions */}
                <div className="flex items-center">
                    {onReassign && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onReassign(student);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-primary-cyan transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 mr-1"
                            title="Reassign Student"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </button>
                    )}

                    {showDeleteButton && onDelete && (
                        !showDeleteConfirm ? (
                            <button
                                onClick={handleDeleteClick}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Delete Student"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        ) : (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={confirmDelete}
                                    className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={cancelDelete}
                                    className="px-2 py-1 text-xs bg-white/10 text-text-secondary rounded hover:bg-white/20"
                                >
                                    Cancel
                                </button>
                            </div>
                        )
                    )}

                    {!onReassign && !showDeleteButton && (
                        <svg className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}
