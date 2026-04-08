import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Users, LayoutGrid, Settings as SettingsIcon, LogOut, ChevronLeft, Save, Globe, Eye, Loader2
} from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const settingsRef = doc(db, "system", "config");
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
            const settingsRef = doc(db, "system", "config");
            await setDoc(settingsRef, settings, { merge: true });
            alert("સેટિંગ્સ સફળતાપૂર્વક સાચવવામાં આવ્યા છે! (Settings saved successfully!)");
        } catch (err) {
            console.error("Save settings error:", err);
            alert("ભૂલ: સેટિંગ્સ સાચવી શકાયા નથી. (Error saving settings)");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/pap/login');
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-inter">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex h-screen sticky top-0">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-10">
                        <img src="/logo.png" className="w-12 h-12 object-contain mix-blend-multiply drop-shadow-sm" alt="logo" />
                        <h2 className="gujarati text-xl font-black text-gray-900 leading-none">શ્રી લાલાબાપા સેવા સમિતિ</h2>
                    </div>
                    
                    <nav className="space-y-1">
                        <NavItem to="/pap" active={location.pathname === '/pap'} icon={<LayoutGrid className="w-4 h-4" />} label="Overview" />
                        <NavItem to="/pap/members" active={location.pathname === '/pap/members'} icon={<Users className="w-4 h-4" />} label="Members List" />
                        <NavItem to="/pap/settings" active={location.pathname === '/pap/settings'} icon={<SettingsIcon className="w-4 h-4" />} label="Settings" />
                    </nav>
                </div>
                
                <div className="mt-auto p-6 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-bold text-xs uppercase tracking-widest">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-40 gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">સિસ્ટમ સેટિંગ્સ (System Settings)</h1>
                            <p className="text-lalabapa-red text-[10px] uppercase font-black tracking-widest mt-0.5">Configure Form Redirects & UI Visibility</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-12 max-w-3xl mx-auto space-y-8 pb-32 md:pb-12">
                    {isLoading ? (
                        <div className="p-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 opacity-20" />
                            Loading System Config...
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="p-8 md:p-10 space-y-12">
                                {/* Redirect URL */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-100">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="gujarati text-xl font-black text-gray-900 leading-tight">સર્વે લિંક (Survey Redirect Link)</h3>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mt-1">Configure where the home button leads</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">Redirect Managed Externally</h3>
                                                <p className="text-xs text-gray-400">The home page button redirect is now managed at the /backup route.</p>
                                            </div>
                                        </div>
                                        <Link to="/backup" className="inline-flex items-center gap-2 text-lalabapa-red font-bold text-xs uppercase tracking-widest hover:underline mt-2">
                                             Go to Redirect Control <ChevronLeft className="w-4 h-4 rotate-180" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Visibility Toggle */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-100">
                                            <Eye className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="gujarati text-xl font-black text-gray-900 leading-tight">બટન પ્રદર્શિત કરો (Button Visibility)</h3>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mt-1">Show or hide the survey button on homepage</p>
                                        </div>
                                    </div>
                                    <label className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[2rem] border-2 border-gray-100 cursor-pointer group hover:border-lalabapa-gold-primary transition-all">
                                        <div className="flex flex-col">
                                            <span className="gujarati font-black text-lg text-gray-800">હોમ પેજ પર બટન બતાવો</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toggle Survey Availability</span>
                                        </div>
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
                                    className="w-full py-6 bg-lalabapa-red text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-red-500/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />} સેટિંગ્સ સાચવો (Save Configuration)
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Link to="/pap" className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/pap' ? 'text-lalabapa-red' : 'text-gray-400'}`}>
                    <LayoutGrid className="w-5 h-5" />
                    <span className="text-[10px] font-bold">OVERVIEW</span>
                </Link>
                <Link to="/pap/members" className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/pap/members' ? 'text-lalabapa-red' : 'text-gray-400'}`}>
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-bold">MEMBERS</span>
                </Link>
                <Link to="/pap/settings" className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/pap/settings' ? 'text-lalabapa-red' : 'text-gray-400'}`}>
                    <SettingsIcon className="w-5 h-5" />
                    <span className="text-[10px] font-bold">SETTINGS</span>
                </Link>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-gray-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="text-[10px] font-bold">LOGOUT</span>
                </button>
            </nav>
        </div>
    );
};

const NavItem = ({ to, active, icon, label }) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold text-sm ${
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}>
        {icon}
        {label}
    </Link>
);

export default Settings;
