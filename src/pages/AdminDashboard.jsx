import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { 
  Users, Settings as SettingsIcon, LogOut, ChevronRight, LayoutGrid
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        families: 0
    });
    const [recentMembers, setRecentMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Get all members for stats
                const membersQuery = query(collection(db, "members"));
                const querySnapshot = await getDocs(membersQuery);
                const allMembers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Get configuration
                const settingsRef = doc(db, "system", "config");
                const settingsSnap = await getDoc(settingsRef);
                const activeMembers = allMembers.filter(m => m.isActive !== false);
                
                // 1. Total Members & Families
                const totalMembersCount = activeMembers.reduce((sum, data) => sum + (Number(data.family_members_count) || 1), 0);
                const familiesCount = activeMembers.length;
                
                // 2. Today's Entries (among active members)
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);
                const todayEntries = activeMembers.filter(m => {
                    const createdAt = m.createdAt?.toDate?.() || new Date(0);
                    return createdAt >= startOfToday;
                });

                // Get recent entries
                const recentQuery = query(
                    collection(db, "members"),
                    orderBy("createdAt", "desc"),
                    limit(5)
                );
                const recentSnapshot = await getDocs(recentQuery);
                const recentList = recentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                setStats({
                    total: totalMembersCount,
                    today: todayEntries.length,
                    families: familiesCount
                });

                setRecentMembers(recentList);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);


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
            {/* Basic Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
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
                    <div className="mb-6">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Admin Account</p>
                      <p className="text-xs text-gray-700 font-medium truncate">{auth.currentUser?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-bold text-xs uppercase tracking-widest">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-40 gap-3">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">સિસ્ટમ સ્ટેટસ (System Status)</h1>
                      <p className="text-lalabapa-red text-[10px] uppercase font-black tracking-widest mt-0.5">Real-time Administration Panel</p>
                    </div>
                </header>

                <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-8 max-w-7xl mx-auto">
                    {/* Basic Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <BasicStat value={stats.total} label="કુલ સભ્યો" sub="TOTAL MEMBERS" color="blue" />
                        <BasicStat value={stats.today} label="આજની એન્ટ્રી" sub="TODAY'S ENTRIES" color="red" />
                        <BasicStat value={stats.families} label="કુલ કુટુંબો" sub="TOTAL FAMILIES" color="gold" />
                    </div>


                    {/* Simple Table Card */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                            <h3 className="gujarati text-lg font-bold text-gray-800">તાજેતરની એન્ટ્રીઓ (RECENT ENTRIES)</h3>
                            <Link to="/pap/members" className="text-blue-500 text-xs font-bold hover:underline uppercase transition-all tracking-widest">VIEW ALL RECORDS</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50">
                                    <tr>
                                        <th className="px-8 py-4 font-bold">IDENTITY</th>
                                        <th className="px-8 py-4 font-bold">CONTACT</th>
                                        <th className="px-8 py-4 font-bold">AREA (LOCATION)</th>
                                        <th className="px-8 py-4 font-bold">JOINED</th>
                                        <th className="px-8 py-4 text-right font-bold">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentMembers.map((member) => (
                                        <tr key={member.id} onClick={() => navigate(`/pap/members/${member.id}`)} className="cursor-pointer hover:bg-gray-50/50 transition-colors font-medium">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-gray-800 gujarati text-base leading-tight">{member.main_member}</div>
                                                <div className="text-[10px] text-lalabapa-red font-bold uppercase tracking-wider mt-1">{member.member_id || 'ID_PENDING'}</div>
                                            </td>
                                            <td className="px-8 py-5 text-gray-500 text-sm">{member.contact?.mobile}</td>
                                            <td className="px-8 py-5 text-gray-500 gujarati text-sm">{member.address?.area || '—'}</td>
                                            <td className="px-8 py-5 text-gray-500 text-xs font-mono">{member.createdAt?.toDate ? member.createdAt.toDate().toLocaleDateString('gu-IN') : '—'}</td>
                                            <td className="px-8 py-5 text-right">
                                                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                                            </td>
                                        </tr>
                                    ))}
                                    {recentMembers.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-gray-300 gujarati italic">કોઈ માહિતી મળી નથી</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
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

const BasicStat = ({ value, label, sub, color }) => {
    const colorClasses = {
        blue: 'border-blue-100 bg-blue-50/10 text-blue-600',
        red: 'border-red-100 bg-red-50/10 text-red-600',
        gold: 'border-amber-100 bg-amber-50/10 text-amber-600'
    };
    return (
        <div className={`p-6 md:p-8 rounded-3xl border-2 transition-all hover:scale-[1.02] ${colorClasses[color] || 'border-gray-200 bg-white'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-4 opacity-70">{sub}</p>
            <h4 className="gujarati text-gray-800 text-lg font-bold mb-2">{label}</h4>
            <div className={`text-4xl font-black ${color === 'red' ? 'text-lalabapa-red' : color === 'gold' ? 'text-amber-600' : 'text-blue-700'}`}>
                {value}
            </div>
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

export default AdminDashboard;
