'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function ChairmanUploadPage() {
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        department: '',
        year: '',
        fileType: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        // TODO: Implement file upload logic
        setTimeout(() => {
            setUploading(false);
            alert('Material uploaded successfully!');
        }, 2000);
    };

    return (
        <DashboardLayout userRole="chairman">
            <main className="relative min-h-screen p-6 sm:p-8 lg:p-10">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h2 className="!text-3xl sm:!text-4xl font-bold mb-2">Upload Material</h2>
                        <p className="text-text-secondary">
                            Share study materials with students
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="glass-card">
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Material Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Digital Electronics Notes"
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the material..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 transition-all resize-none"
                                />
                            </div>

                            {/* Department and Year */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Department *
                                    </label>
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 transition-all"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="CSE">Computer Science</option>
                                        <option value="ECE">Electronics & Communication</option>
                                        <option value="EEE">Electrical & Electronics</option>
                                        <option value="ME">Mechanical Engineering</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Year *
                                    </label>
                                    <select
                                        required
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 transition-all"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                            </div>

                            {/* File Type */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    File Type *
                                </label>
                                <select
                                    required
                                    value={formData.fileType}
                                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 transition-all"
                                >
                                    <option value="">Select Type</option>
                                    <option value="PDF">PDF</option>
                                    <option value="DOC">Document</option>
                                    <option value="PPT">Presentation</option>
                                    <option value="VIDEO">Video</option>
                                </select>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Upload File *
                                </label>
                                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-primary-cyan/50 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        required
                                        className="hidden"
                                        id="file-upload"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <svg className="w-12 h-12 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-text-secondary mb-1">Click to upload or drag and drop</p>
                                        <p className="text-xs text-text-secondary">PDF, DOC, PPT, or Video (max 50MB)</p>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={uploading}
                                className="btn btn-primary w-full justify-center"
                            >
                                {uploading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Upload Material
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="h-8 sm:h-0 mobile-nav-safe"></div>
                </div>
            </main>
        </DashboardLayout>
    );
}
