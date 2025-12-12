import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold">UmukoziHR Jobs</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Connecting African talent with global opportunities. Part of the UmukoziHR ecosystem.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Candidates</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/jobs" className="hover:text-white">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/signup?type=candidate" className="hover:text-white">
                  Create Profile
                </Link>
              </li>
              <li>
                <a
                  href="https://umukozihr-tailor.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Resume Tailor
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/signup?type=employer" className="hover:text-white">
                  Post Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-white">
                  Company Profiles
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} UmukoziHR. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
