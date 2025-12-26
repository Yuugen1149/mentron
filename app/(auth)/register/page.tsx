'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/lib/constants';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [department, setDepartment] = useState('');
    const [year, setYear] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate Gmail only
        if (!email.endsWith('@gmail.com')) {
            setError('Only Gmail accounts are allowed');
            setLoading(false);
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            // Create auth user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                // Handle duplicate email specifically
                if (signUpError.message.includes('already registered') ||
                    signUpError.message.includes('already exists') ||
                    signUpError.message.includes('User already registered')) {
                    throw new Error('This email is already registered. Please login instead.');
                }
                throw signUpError;
            }

            if (authData.user) {
                // Create student profile
                const { error: profileError } = await supabase
                    .from('group_members')
                    .insert({
                        id: authData.user.id,
                        email,
                        department,
                        year: parseInt(year),
                        name,
                        roll_number: rollNumber,
                    });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    // If profile creation fails, clean up auth user
                    await supabase.auth.signOut();
                    throw new Error(`Failed to create profile: ${profileError.message}`);
                }

                // Successfully created - redirect to student dashboard
                router.push('/student');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to create account');
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            {/* Background glow effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary-purple/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-cyan/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary-purple to-primary-cyan mb-4 shadow-lg shadow-secondary-purple/25">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                        Join Mentron
                    </h1>
                    <p className="text-text-secondary text-sm sm:text-base">
                        Create your student account
                    </p>
                </div>

                {/* Register Card */}
                <div className="glass-card fade-in p-6 sm:p-8">
                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Error Alert */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-pink/10 border border-accent-pink/20">
                                <svg className="w-5 h-5 text-accent-pink flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-accent-pink text-sm">{error}</p>
                                    {error.includes('already registered') && (
                                        <Link
                                            href="/login"
                                            className="text-primary-cyan hover:underline text-sm mt-2 inline-flex items-center gap-1 font-medium"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                            Go to Login Page
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Full Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-text-primary">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    autoComplete="name"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 
                                               text-text-primary placeholder:text-text-secondary/50
                                               focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 
                                               transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Roll Number Field */}
                        <div className="space-y-2">
                            <label htmlFor="rollNumber" className="block text-sm font-medium text-text-primary">
                                Roll Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                </div>
                                <input
                                    id="rollNumber"
                                    type="text"
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    placeholder="e.g. 2023ECE001"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 
                                               text-text-primary placeholder:text-text-secondary/50
                                               focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 
                                               transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                                Gmail Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@gmail.com"
                                    required
                                    autoComplete="email"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 
                                               text-text-primary placeholder:text-text-secondary/50
                                               focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 
                                               transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Department and Year Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="department" className="block text-sm font-medium text-text-primary">
                                    Department
                                </label>
                                <div className="relative">
                                    <select
                                        id="department"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                                                   text-text-primary appearance-none cursor-pointer
                                                   focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 
                                                   transition-all duration-200"
                                    >
                                        <option value="" className="bg-deep-bg">Select</option>
                                        {DEPARTMENTS.map((dept) => (
                                            <option key={dept.code} value={dept.code} className="bg-deep-bg">
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="year" className="block text-sm font-medium text-text-primary">
                                    Year
                                </label>
                                <div className="relative">
                                    <select
                                        id="year"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                                                   text-text-primary appearance-none cursor-pointer
                                                   focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 
                                                   transition-all duration-200"
                                    >
                                        <option value="" className="bg-deep-bg">Select</option>
                                        {ACADEMIC_YEARS.map((yr) => (
                                            <option key={yr.value} value={yr.value} className="bg-deep-bg">
                                                {yr.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    required
                                    autoComplete="new-password"
                                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 
                                               text-text-primary placeholder:text-text-secondary/50
                                               focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 
                                               transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary-cyan transition-colors p-1 rounded-lg hover:bg-white/5"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    required
                                    autoComplete="new-password"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 
                                               text-text-primary placeholder:text-text-secondary/50
                                               focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 
                                               transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-semibold text-sm uppercase tracking-wide mt-2
                                       bg-gradient-to-r from-secondary-purple to-primary-cyan text-white
                                       hover:shadow-lg hover:shadow-secondary-purple/30 hover:scale-[1.02]
                                       focus:outline-none focus:ring-2 focus:ring-secondary-purple/50 focus:ring-offset-2 focus:ring-offset-deep-bg
                                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                       transition-all duration-200 touch-manipulation"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-deep-bg text-text-secondary">Already have an account?</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <Link
                        href="/login"
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                                   bg-white/5 border border-white/10 text-text-primary
                                   hover:bg-white/10 hover:border-white/20
                                   focus:outline-none focus:ring-2 focus:ring-primary-cyan/30
                                   transition-all duration-200 text-sm font-medium touch-manipulation"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign In Instead
                    </Link>
                </div>

                {/* Back to Dashboard Link */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                                   text-text-secondary hover:text-primary-cyan 
                                   hover:bg-white/5 transition-all duration-200 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>

                {/* Mobile safe area padding */}
                <div className="h-8 sm:h-0 mobile-nav-safe" />
            </div>
        </main>
    );
}
