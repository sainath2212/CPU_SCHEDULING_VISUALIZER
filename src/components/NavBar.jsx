import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { MagicButton } from '../components/MagicButton';

const tabs = [
    { path: '/simulator', label: 'Simulator' },
    { path: '/kernel', label: 'Kernel View' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/compare', label: 'Compare' },
    { path: '/recommend', label: 'AI Recommend' },
    { path: '/terminal', label: 'Terminal' },
];

export default function NavBar() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (location.pathname === '/') return null;

    return (
        <div className="flex justify-center w-full sticky top-4 z-[100] mb-6 px-4">
            <nav className="flex items-center border w-full max-w-4xl max-md:w-full max-md:justify-between border-[#444444]/60 bg-[#121212]/90 backdrop-blur-md px-5 py-3.5 rounded-full text-white text-sm shadow-xl">
                <Link to="/" className="flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E64833" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="navbar-logo-icon">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.26.46.4.98.42 1.51h.09a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span className="font-bold text-[#E0E0E0] hidden lg:block tracking-wide">Kernel Monitor</span>
                </Link>

                <div className="hidden md:flex items-center gap-7 ml-auto mr-auto">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) => `relative overflow-hidden h-5 group transition-colors ${isActive ? 'text-[#E64833]' : 'text-[#E0E0E0] hover:text-[#E64833]'}`}
                        >
                            <span className="block group-hover:-translate-y-full transition-transform duration-300 font-medium">{tab.label}</span>
                            <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300 font-medium text-[#E64833]">{tab.label}</span>
                        </NavLink>
                    ))}
                </div>

                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden text-[#E0E0E0] hover:text-[#E64833] transition ml-auto"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        {isMobileMenuOpen ? (
                            <path d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {isMobileMenuOpen && (
                    <div className="absolute top-16 left-0 right-0 mx-4 bg-[#121212]/95 backdrop-blur-xl border border-[#444444]/60 rounded-xl shadow-2xl p-4 flex flex-col items-center gap-4 md:hidden z-50">
                        {tabs.map((tab) => (
                            <NavLink
                                key={tab.path}
                                to={tab.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `text-sm font-medium transition-colors ${isActive ? 'text-[#E64833]' : 'text-[#E0E0E0] hover:text-[#E64833]'}`
                                }
                            >
                                {tab.label}
                            </NavLink>
                        ))}
                        <div className="flex flex-col gap-3 w-full mt-2">
                            <a href="https://github.com/sainath2212/CPU_SCHEDULING_VISUALIZER" target="_blank" rel="noreferrer" className="w-full">
                                <MagicButton className="w-full justify-center">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                    </svg>
                                    GitHub
                                </MagicButton>
                            </a>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}
