import Link from "next/link";
import Image from "next/image";
import { Sparkles, ExternalLink, Mail, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="glass-heavy border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6 group">
                <Image
                  src="/umukozi-logo.png"
                  alt="UmukoziHR"
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
                <div>
                  <span className="text-xl font-bold text-white">UmukoziHR</span>
                  <span className="text-purple-400 font-medium ml-1">Jobs</span>
                </div>
              </Link>
              <p className="text-gray-400 max-w-md leading-relaxed mb-6">
                Connecting African talent with global opportunities. Part of the UmukoziHR ecosystem 
                — where AI meets human potential.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="mailto:team@umukozihr.com"
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* For Candidates */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">For Candidates</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/jobs" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    Browse Jobs
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/signup?type=candidate" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    Create Profile
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://umukozihr-tailor.onrender.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    Resume Tailor
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                </li>
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">For Employers</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/signup?type=employer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    Post Jobs
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    Company Profiles
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://recruit.umukozihr.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    Enterprise Recruit
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} UmukoziHR. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
