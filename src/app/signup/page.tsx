"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Building2, Eye, EyeOff, Loader2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

function SignUpForm() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as "candidate" | "employer" | null;
  
  const [userType, setUserType] = useState<"candidate" | "employer">(initialType || "candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
          data: {
            user_type: userType,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className={`max-w-md w-full ${mounted ? 'animate-scale-in' : 'opacity-0'}`}>
          <div className="glass-card p-10 text-center">
            <div className="neu-raised w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Check Your Email</h2>
            <p className="text-gray-400 mb-8">
              We&apos;ve sent a confirmation link to <span className="text-gradient font-semibold">{email}</span>. Click the link to activate your account.
            </p>
            <Link
              href="/signin"
              className="btn-primary inline-flex items-center justify-center gap-3 text-lg"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className={`max-w-md w-full relative z-10 ${mounted ? 'animate-scale-in' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6 group">
            <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center group-hover:animate-pulse-glow transition-all">
              <Image src="/umukozi-logo.png" alt="UmukoziHR" width={40} height={40} className="rounded-lg" />
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3">Join UmukoziHR</h1>
          <p className="text-gray-400">Start your career journey today</p>
        </div>

        <div className="glass-card p-8">
          {/* Gradient accent line */}
          <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          
          {/* User Type Selection - Neumorphic toggles */}
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setUserType("candidate")}
              className={`flex-1 flex items-center justify-center gap-3 py-4 px-4 rounded-xl transition-all duration-300 ${
                userType === "candidate"
                  ? "neu-pressed border border-purple-500/30 text-white"
                  : "neu-raised text-gray-400 hover:text-white"
              }`}
            >
              <User className={`h-5 w-5 ${userType === "candidate" ? "text-purple-400" : ""}`} />
              <span className="font-medium">Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType("employer")}
              className={`flex-1 flex items-center justify-center gap-3 py-4 px-4 rounded-xl transition-all duration-300 ${
                userType === "employer"
                  ? "neu-pressed border border-blue-500/30 text-white"
                  : "neu-raised text-gray-400 hover:text-white"
              }`}
            >
              <Building2 className={`h-5 w-5 ${userType === "employer" ? "text-blue-400" : ""}`} />
              <span className="font-medium">Employer</span>
            </button>
          </div>

          {error && (
            <div className="glass p-4 border-red-500/30 bg-red-500/10 rounded-xl mb-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-glass"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-glass"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass pl-12 pr-12"
                  placeholder="Create a password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Create {userType === "candidate" ? "Candidate" : "Employer"} Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/signin" className="text-gradient font-semibold hover:opacity-80 transition-opacity">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        
        {/* Trust badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-sm">
          <Lock className="h-4 w-4" />
          <span>Your data is protected with end-to-end encryption</span>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
