import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, LayoutDashboard, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminDb } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const LandingPage = () => {
    const [settings, setSettings] = useState({
        surveyRedirectUrl: '/join',
        showSurveyButton: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsRef = doc(adminDb, "system", "config");
                const settingsSnap = await getDoc(settingsRef);
                if (settingsSnap.exists()) {
                    setSettings(settingsSnap.data());
                }
            } catch (err) {
                console.error("Fetch settings error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const isExternal = settings.surveyRedirectUrl.startsWith('http');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-lalabapa-red-dark to-lalabapa-red text-warm-white p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lalabapa-gold-primary rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lalabapa-gold-primary rounded-full blur-[120px] animate-pulse"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl w-full text-center z-10"
            >
                {/* Logo Section */}
                <div className="mb-8 flex justify-center">
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0]
                        }}
                        transition={{ 
                            duration: 6, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="relative w-48 h-48 md:w-64 md:h-64"
                    >
                        {/* Radiant Glow Behind Logo (Pulsing) */}
                        <motion.div 
                            animate={{ scale: [1.1, 1.3, 1.1], opacity: [0.2, 0.3, 0.2] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-lalabapa-gold-primary rounded-full blur-[60px]"
                        ></motion.div>
                        <motion.div 
                            animate={{ scale: [1.5, 1.8, 1.5], opacity: [0.1, 0.15, 0.1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute inset-0 bg-lalabapa-gold-primary rounded-full blur-[100px]"
                        ></motion.div>
                        
                        <img 
                            src="logo.png" 
                            alt="Shree Lalabapa 3D Coin" 
                            className="relative w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(212,175,55,0.4)]"
                        />
                    </motion.div>
                </div>

                {/* Identity */}
                <h1 className="gujarati text-4xl md:text-6xl font-bold mb-4 text-lalabapa-gold-light drop-shadow-md">
                    શ્રી લાલાબાપા સેવા સમિતિ - વાડજ, અમદાવાદ
                </h1>
                <h2 className="text-xl md:text-2xl font-light italic mb-2 opacity-90 tracking-widest text-warm-white/80">
                    Shri Lalabapa Seva Samiti
                </h2>
                <p className="gujarati text-lg md:text-xl mb-12 opacity-80 text-warm-white/70">
                    Trust Reg. No.: A/5366/Ahmedabad · વાડજ, અમદાવાદ
                </p>

                {/* Call To Action */}
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center h-20">
                    {loading ? (
                        <Loader2 className="w-8 h-8 text-lalabapa-gold-primary animate-spin opacity-20" />
                    ) : settings.showSurveyButton ? (
                        isExternal ? (
                            <a href={settings.surveyRedirectUrl} target="_blank" rel="noopener noreferrer" className="group relative w-full md:w-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-lalabapa-gold-dark to-lalabapa-gold-light rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <button className="relative px-8 py-5 bg-lalabapa-red-dark hover:bg-lalabapa-red transition-all duration-300 rounded-xl leading-none flex items-center justify-center gap-3 border border-lalabapa-gold-primary/30 w-full">
                                    <UserPlus className="w-6 h-6 text-lalabapa-gold-primary" />
                                    <span className="gujarati text-xl font-bold text-lalabapa-gold-light">
                                        માહિતી સર્વે ફોર્મ ભરવા અહીં ક્લિક કરો
                                    </span>
                                </button>
                            </a>
                        ) : (
                            <Link to={settings.surveyRedirectUrl} className="group relative w-full md:w-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-lalabapa-gold-dark to-lalabapa-gold-light rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <button className="relative px-8 py-5 bg-lalabapa-red-dark hover:bg-lalabapa-red transition-all duration-300 rounded-xl leading-none flex items-center justify-center gap-3 border border-lalabapa-gold-primary/30 w-full">
                                    <UserPlus className="w-6 h-6 text-lalabapa-gold-primary" />
                                    <span className="gujarati text-xl font-bold text-lalabapa-gold-light">
                                        માહિતી સર્વે ફોર્મ ભરવા અહીં ક્લિક કરો
                                    </span>
                                </button>
                            </Link>
                        )
                    ) : null}
                </div>

                {/* Subtle Admin Entry */}
                <Link to="/pap/login" className="mt-16 inline-flex items-center gap-2 opacity-20 hover:opacity-100 text-xs text-warm-white/50 hover:text-lalabapa-gold-light transition-all duration-300 uppercase tracking-widest">
                    <LayoutDashboard className="w-3 h-3" />
                    Admin Access
                </Link>
            </motion.div>
            
            {/* Footer Decorative Line */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-lalabapa-gold-primary/30 to-transparent"></div>
        </div>
    );
};

export default LandingPage;
