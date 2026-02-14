import { useState, useEffect } from 'react';
import { Heart, Activity, Menu, X, Zap } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ currentPage, onNavigate }) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'home', label: 'Home', icon: Heart },
        { id: 'scanner', label: 'ECG Scanner', icon: Activity },
        { id: 'assistant', label: 'AI Assistant', icon: Zap },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-inner container">
                <button className="navbar-brand" onClick={() => onNavigate('home')}>
                    <div className="brand-icon">
                        <Heart size={22} />
                    </div>
                    <span className="brand-text">
                        <span className="text-gradient">HeartAlert</span> AI
                    </span>
                </button>

                <div className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-link ${currentPage === item.id ? 'nav-link-active' : ''}`}
                            onClick={() => {
                                onNavigate(item.id);
                                setMenuOpen(false);
                            }}
                        >
                            <item.icon size={16} />
                            {item.label}
                        </button>
                    ))}
                </div>

                <button
                    className="navbar-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>
        </nav>
    );
}
