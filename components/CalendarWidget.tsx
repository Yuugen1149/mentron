'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    event_date: string;
    event_time?: string;
    event_type: 'material' | 'deadline' | 'meeting' | 'holiday' | 'exam';
    department?: string;
    year?: number;
}

interface CalendarWidgetProps {
    userRole: 'student' | 'execom' | 'chairman';
    onEventClick?: (event: CalendarEvent) => void;
}

export function CalendarWidget({ userRole, onEventClick }: CalendarWidgetProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const canCreateEvents = userRole === 'execom' || userRole === 'chairman';

    // Fetch events for current month
    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        try {
            const month = format(currentDate, 'yyyy-MM');
            const response = await fetch(`/api/calendar/events?month=${month}`);
            const data = await response.json();
            setEvents(data.events || []);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get events for a specific date
    const getEventsForDate = (date: Date) => {
        return events.filter(event =>
            isSameDay(new Date(event.event_date), date)
        );
    };

    const eventTypeColors = {
        material: 'bg-blue-500',
        deadline: 'bg-red-500',
        meeting: 'bg-purple-500',
        holiday: 'bg-green-500',
        exam: 'bg-orange-500',
    };

    const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
        if (!canCreateEvents) return;

        setLoading(true);
        try {
            const response = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });

            if (response.ok) {
                await fetchEvents();
                setShowEventModal(false);
                setSelectedDate(null);
            }
        } catch (error) {
            console.error('Failed to create event:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Calendar</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-sm font-medium min-w-[120px] text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs font-semibold text-text-secondary py-2">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {daysInMonth.map((day, i) => {
                    const dayEvents = getEventsForDate(day);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentDate);

                    return (
                        <button
                            key={i}
                            onClick={() => {
                                setSelectedDate(day);
                                if (canCreateEvents) {
                                    setShowEventModal(true);
                                }
                            }}
                            className={`aspect-square p-1 rounded-lg text-xs transition-all relative ${isToday
                                    ? 'bg-primary-cyan text-background font-bold'
                                    : isCurrentMonth
                                        ? 'hover:bg-white/10'
                                        : 'text-text-secondary/50'
                                }`}
                        >
                            <span>{format(day, 'd')}</span>
                            {dayEvents.length > 0 && (
                                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                                    {dayEvents.slice(0, 3).map((event, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1 h-1 rounded-full ${eventTypeColors[event.event_type]}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Upcoming Events */}
            <div className="border-t border-white/10 pt-4">
                <h4 className="text-sm font-semibold mb-2">Upcoming Events</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto hide-scrollbar">
                    {events.slice(0, 3).map((event) => (
                        <button
                            key={event.id}
                            onClick={() => onEventClick?.(event)}
                            className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-start gap-2">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${eventTypeColors[event.event_type]}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{event.title}</p>
                                    <p className="text-xs text-text-secondary">
                                        {format(new Date(event.event_date), 'MMM d, yyyy')}
                                        {event.event_time && ` • ${event.event_time}`}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                    {events.length === 0 && (
                        <p className="text-xs text-text-secondary text-center py-4">No upcoming events</p>
                    )}
                </div>
            </div>

            {/* Create Event Button */}
            {canCreateEvents && (
                <button
                    onClick={() => {
                        setSelectedDate(new Date());
                        setShowEventModal(true);
                    }}
                    className="btn btn-primary w-full mt-4 text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Event
                </button>
            )}

            {/* Event Creation Modal */}
            {showEventModal && canCreateEvents && (
                <EventModal
                    selectedDate={selectedDate || new Date()}
                    onClose={() => {
                        setShowEventModal(false);
                        setSelectedDate(null);
                    }}
                    onSubmit={handleCreateEvent}
                    loading={loading}
                />
            )}
        </div>
    );
}

// Event Creation Modal Component
function EventModal({
    selectedDate,
    onClose,
    onSubmit,
    loading,
}: {
    selectedDate: Date;
    onClose: () => void;
    onSubmit: (data: Partial<CalendarEvent>) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: format(selectedDate, 'yyyy-MM-dd'),
        event_time: '',
        event_type: 'meeting' as CalendarEvent['event_type'],
        department: '',
        year: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            year: formData.year ? parseInt(formData.year) : undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Create Event</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Event Title *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20"
                            placeholder="Enter event title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 resize-none"
                            rows={3}
                            placeholder="Event description (optional)"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.event_date}
                                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Time</label>
                            <input
                                type="time"
                                value={formData.event_time}
                                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Event Type *</label>
                        <select
                            required
                            value={formData.event_type}
                            onChange={(e) => setFormData({ ...formData, event_type: e.target.value as CalendarEvent['event_type'] })}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20"
                        >
                            <option value="meeting">Meeting</option>
                            <option value="deadline">Deadline</option>
                            <option value="exam">Exam</option>
                            <option value="holiday">Holiday</option>
                            <option value="material">Material Upload</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20"
                            >
                                <option value="">All Departments</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Mechanical">Mechanical</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Year</label>
                            <select
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20"
                            >
                                <option value="">All Years</option>
                                <option value="1">Year 1</option>
                                <option value="2">Year 2</option>
                                <option value="3">Year 3</option>
                                <option value="4">Year 4</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
