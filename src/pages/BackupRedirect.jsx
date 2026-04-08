import { useEffect, useState } from 'react';
import { adminDb } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Save, Globe, Eye, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BackupRedirect = () => {
    const [settings, setSettings] = useState({
        surveyRedirectUrl: '/join',
        showSurveyButton: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                // Connecting to Admin Project (Project 2)
                const settingsRef = doc(adminDb, "system", "config");
                const settingsSnap = await getDoc(settingsRef);
                if (settingsSnap.exists()) {
                    setSettings(settingsSnap.data());
                }
            } catch (err) {
                console.error("Fetch settings error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const settingsRef = doc(adminDb, "system", "config");
            await setDoc(settingsRef, settings, { merge: true });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error("Save settings error:", err);
            alert("Error saving settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="w-10 h-10 animate-spin text-lalabapa-red mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Configuration...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] font-inter selection:bg-lalabapa-red/10">
            {/* Minimal Header */}
            <header className="bg-white border-b border-gray-100 px-6 py-6 sticky top-0 z-50">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back Home</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" className="w-8 h-8 object-contain mix-blend-multiply" alt="logo" />
                        <span className="text-xs font-black text-gray-900 uppercase tracking-tighter">Backup Control</span>
                    </div>
                </div>
            </header>

            <main className="max-w-xl mx-auto p-6 md:pt-16 pb-32">
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Redirect Control Panel</h1>
                    <p className="text-gray-400 text-sm font-medium">Manage the homepage survey button redirect URL and visibility locally from Project 2.</p>
                </div>

                <div className="space-y-6">
                    {/* URL Input Card */}
                    <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm transition-all hover:border-gray-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-100">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="gujarati text-xl font-black text-gray-900 leading-tight">સર્વે લિંક (Survey Redirect)</h3>
                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mt-1">Landing page button destination</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                value={settings.surveyRedirectUrl}
                                onChange={(e) => setSettings(prev => ({ ...prev, surveyRedirectUrl: e.target.value }))}
                                placeholder="e.g. /join or https://google-form-link"
                                className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-50 rounded-2xl text-base font-bold focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-200 shadow-inner"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setSettings(p => ({...p, surveyRedirectUrl: '/join'}))} className="px-4 py-3 rounded-xl border border-gray-100 text-[10px] font-black text-gray-400 uppercase hover:bg-gray-50 transition-all">Internal Form</button>
                                <button onClick={() => setSettings(p => ({...p, surveyRedirectUrl: ''}))} className="px-4 py-3 rounded-xl border border-gray-100 text-[10px] font-black text-gray-400 uppercase hover:bg-gray-50 transition-all">Clear URL</button>
                            </div>
                        </div>
                    </div>

                    {/* Visibility Card */}
                    <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm transition-all hover:border-gray-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-100">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="gujarati text-xl font-black text-gray-900 leading-tight">બટન સ્ટેટસ (Button Visibility)</h3>
                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mt-1">Show or hide on homepage</p>
                            </div>
                        </div>

                        <label className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border-2 border-transparent cursor-pointer group hover:bg-white hover:border-amber-500/20 transition-all">
                            <span className="gujarati font-black text-lg text-gray-800">બટન બતાવો (Show Button)</span>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={settings.showSurveyButton}
                                    onChange={(e) => setSettings(prev => ({ ...prev, showSurveyButton: e.target.checked }))}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-lalabapa-red transition-all"></div>
                                <div className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-all peer-checked:translate-x-6"></div>
                            </div>
                        </label>
                    </div>

                    {/* Save Button */}
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-6 bg-gray-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-8"
                    >
                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {showSuccess ? "CONFIG SAVED!" : "Update Configuration"}
                    </button>

                    {showSuccess && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 text-green-600 p-4 rounded-2xl flex items-center justify-center gap-3 border border-green-100 shadow-sm"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Database updated successfully</span>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Footer Aesthetic */}
            <footer className="fixed bottom-0 left-0 right-0 p-8 pt-20 pointer-events-none">
                <div className="max-w-xl mx-auto flex justify-center opacity-5">
                    <h2 className="gujarati text-6xl font-black text-gray-900">શ્રી લાલાબાપા</h2>
                </div>
            </footer>
        </div>
    );
};

export default BackupRedirect;
