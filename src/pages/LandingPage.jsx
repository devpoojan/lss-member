import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, LayoutDashboard, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
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
                const settingsRef = doc(db, "system", "config");
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
            {/* Background Aesthetic (Cleaned Głow) */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                {/* Subtle texture or plain background */}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl w-full text-center z-10"
            >
                {/* Top Header Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 flex flex-col items-center"
                >
                    <div className="w-20 h-24 md:w-28 md:h-36 relative mb-2 p-1.5 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                        <img
                            src="/sati-dudhi-mata.png"
                            alt="Sati Dudhi Mata"
                            className="w-full h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                    <p className="gujarati text-sm md:text-base text-lalabapa-gold-light font-bold drop-shadow-sm tracking-wide">
                        || જય શ્રી સતી દુધી માતાજી ||
                    </p>
                </motion.div>

                {/* Hero Logo Section (Three Portraits in a Row) */}
                <div className="mb-10 md:mb-16 flex flex-row items-center justify-center gap-2 md:gap-16 w-full max-w-full px-1 md:px-4">
                    {/* Left Portrait: Lalabapa */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center group flex-1 md:flex-none relative"
                    >
                        <div className="relative w-20 h-20 md:w-52 md:h-52">
                            <div className="relative w-full h-full rounded-full border border-lalabapa-gold-primary/50 md:border-2 overflow-hidden bg-lalabapa-red-dark">
                                <img
                                    src="/lalabapa.png"
                                    alt="Lalabapa"
                                    className="w-full h-full object-cover object-top scale-[1.2] group-hover:scale-[1.3] transition-transform duration-700"
                                />
                            </div>
                        </div>
                        <p className="gujarati mt-3 md:mt-5 text-[9px] md:text-2xl font-bold text-lalabapa-gold-light drop-shadow-lg whitespace-nowrap">
                            || પ.પૂ. શ્રી લાલાબાપા ||
                        </p>
                    </motion.div>

                    {/* Center: Main Samiti Logo */}
                    <div className="flex justify-center flex-1 md:flex-none relative">
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 1, 0, -1, 0]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative w-28 h-28 md:w-64 md:h-64"
                        >
                            <img
                                src="/logo.png"
                                alt="Shree Lalabapa 3D Coin"
                                className="relative w-full h-full object-contain"
                            />
                        </motion.div>
                    </div>

                    {/* Right Portrait: Jaga Swami */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center group flex-1 md:flex-none relative"
                    >
                        <div className="relative w-20 h-20 md:w-52 md:h-52">
                            <div className="relative w-full h-full rounded-full border border-lalabapa-gold-primary/50 md:border-2 overflow-hidden bg-lalabapa-red-dark">
                                <img
                                    src="/jaga-swami.png"
                                    alt="Jaga Swami"
                                    className="w-full h-full object-cover object-top scale-[1.2] group-hover:scale-[1.3] transition-transform duration-700"
                                />
                            </div>
                        </div>
                        <p className="gujarati mt-3 md:mt-5 text-[9px] md:text-2xl font-bold text-lalabapa-gold-light drop-shadow-lg whitespace-nowrap">
                            || પ.પૂ. શ્રી જાગાસ્વામી ||
                        </p>
                    </motion.div>
                </div>

                {/* Identity */}
                <h1 className="gujarati text-4xl md:text-6xl font-bold mb-4 text-lalabapa-gold-light drop-shadow-md">
                    શ્રી લાલાબાપા સેવા સમિતિ - વાડજ અમદાવાદ
                </h1>
                <h2 className="text-xl md:text-2xl font-light italic mb-2 opacity-90 tracking-widest text-warm-white/80">
                    Shri Lalabapa Seva Samiti
                </h2>
                <p className="gujarati text-lg md:text-xl mb-12 opacity-80 text-warm-white/70">
                    Trust Reg. No.: A/5366/Ahmedabad · વાડજ અમદાવાદ
                </p>

                {/* Call To Action */}
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center h-20">
                    {loading ? (
                        <Loader2 className="w-8 h-8 text-lalabapa-gold-primary animate-spin opacity-20" />
                    ) : settings.showSurveyButton ? (
                        isExternal ? (
                            <a href={settings.surveyRedirectUrl} target="_blank" rel="noopener noreferrer" className="group relative w-full md:w-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-lalabapa-gold-dark to-lalabapa-gold-light rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <button className="relative px-8 py-5 bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all duration-300 rounded-xl leading-none flex items-center justify-center gap-3 border border-lalabapa-gold-primary/30 w-full group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-lalabapa-gold-dark/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                    <UserPlus className="w-6 h-6 text-lalabapa-gold-primary" />
                                    <span className="gujarati text-xl font-bold text-lalabapa-gold-light">
                                        માહિતી સર્વે ફોર્મ ભરવા અહીં ક્લિક કરો
                                    </span>
                                </button>
                            </a>
                        ) : (
                            <Link to={settings.surveyRedirectUrl} className="group relative w-full md:w-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-lalabapa-gold-dark to-lalabapa-gold-light rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <button className="relative px-8 py-5 bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all duration-300 rounded-xl leading-none flex items-center justify-center gap-3 border border-lalabapa-gold-primary/30 w-full group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-lalabapa-gold-dark/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                    <UserPlus className="w-6 h-6 text-lalabapa-gold-primary" />
                                    <span className="gujarati text-xl font-bold text-lalabapa-gold-light">
                                        માહિતી સર્વે ફોર્મ ભરવા અહીં ક્લિક કરો
                                    </span>
                                </button>
                            </Link>
                        )
                    ) : null}
                </div>

            </motion.div>

            {/* Footer Decorative Line */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-lalabapa-gold-primary/30 to-transparent"></div>
        </div>
    );
};

export default LandingPage;
