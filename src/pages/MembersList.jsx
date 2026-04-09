import { auth, db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Download, Star, Filter, Settings as SettingsIcon,
    ChevronRight, LayoutGrid, LogOut, ChevronDown, ChevronLeft, Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

const MembersList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterArea, setFilterArea] = useState('All');
    const [filterGender, setFilterGender] = useState('All');
    const [filterImportant, setFilterImportant] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [user, setUser] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchMembers();
            } else {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "members"));
            const allMembers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filter out deleted/inactive if any (m.isActive !== false)
            const activeMembers = allMembers.filter(m => m.isActive !== false);
            
            // Sort by createdAt descending
            activeMembers.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB - dateA;
            });
            
            setMembers(activeMembers);
        } catch (err) {
            console.error("Fetch members error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(members.map((m, index) => ({
            "Sr. No.": index + 1,
            "Member ID": m.member_id || `SLB-VDJ-${m.id.substring(0, 5).toUpperCase()}`,
            "Full Name (નામ)": m.main_member,
            "Mobile (મોબાઇલ)": m.contact?.mobile || '—',
            "WhatsApp": m.contact?.whatsapp || '—',
            "Mobile 2": m.contact?.mobile2 || '—',
            "Email": m.contact?.email || '—',
            "House No (ઘર નં)": m.address?.house_no || '—',
            "Society (સોસાયટી)": m.address?.society || '—',
            "Landmark (લેન્ડમાર્ક)": m.address?.landmark || '—',
            "Area (વિસ્તાર)": (m.address?.area === 'Other' ? m.address?.custom_area : m.address?.area) || '—',
            "Village/City (ગામ)": (m.address?.village_city === 'Other' ? m.address?.custom_village_city : m.address?.village_city) || '—',
            "District (જિલ્લો)": (m.address?.district === 'Other' ? m.address?.custom_district : m.address?.district) || '—',
            "Pincode (પીનકોડ)": m.address?.pincode || '—',
            "DOB (જન્મ તારીખ)": m.other?.dob || '—',
            "Gender (લિંગ)": m.other?.gender || '—',
            "Society Role (સમાજમાં ભૂમિકા)": m.other?.role || '—',
            "Occupation (વ્યવસાય)": m.occupation || '—',
            "Occupation Detail (વિગત)": m.occupation_detail || '—',
            "Time Contribution (સમયનું યોગદાન)": m.time_contribution === 'Yes' ? 'હા (Yes)' : m.time_contribution === 'No' ? 'ના (No)' : '—',
            "Help Society (સમાજને મદદરૂપ)": m.help_society === 'Yes' ? 'હા (Yes)' : m.help_society === 'No' ? 'ના (No)' : '—',
            "Family Members (સભ્યો)": m.family_members_count || '1',
            "Special Notes (ખાસ નોંધ)": m.other?.notes || '—',
            "Consent (સંમતિ)": m.consent ? "YES" : "NO",
            "Submission Date & Time": m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }).toUpperCase() : '—',
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
        XLSX.writeFile(workbook, `LALABAPA_MEMBERS_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleBulkExportExcel = () => {
        const selectedMembers = members.filter(m => selectedIds.includes(m.id));
        const worksheet = XLSX.utils.json_to_sheet(selectedMembers.map((m, index) => ({
            "Sr. No.": index + 1,
            "Member ID": m.member_id || `SLB-VDJ-${m.id.substring(0, 5).toUpperCase()}`,
            "Full Name (નામ)": m.main_member,
            "Mobile (મોબાઇલ)": m.contact?.mobile || '—',
            "WhatsApp": m.contact?.whatsapp || '—',
            "Mobile 2": m.contact?.mobile2 || '—',
            "Email": m.contact?.email || '—',
            "House No (ઘર નં)": m.address?.house_no || '—',
            "Society (સોસાયટી)": m.address?.society || '—',
            "Landmark (લેન્ડમાર્ક)": m.address?.landmark || '—',
            "Area (વિસ્તાર)": (m.address?.area === 'Other' ? m.address?.custom_area : m.address?.area) || '—',
            "Village/City (ગામ)": (m.address?.village_city === 'Other' ? m.address?.custom_village_city : m.address?.village_city) || '—',
            "District (જિલ્લો)": (m.address?.district === 'Other' ? m.address?.custom_district : m.address?.district) || '—',
            "Pincode (પીનકોડ)": m.address?.pincode || '—',
            "DOB (જન્મ તારીખ)": m.other?.dob || '—',
            "Gender (લિંગ)": m.other?.gender || '—',
            "Society Role (સમાજમાં ભૂમિકા)": m.other?.role || '—',
            "Occupation (વ્યવસાય)": m.occupation || '—',
            "Occupation Detail (વિગત)": m.occupation_detail || '—',
            "Time Contribution (સમયનું યોગદાન)": m.time_contribution === 'Yes' ? 'હા (Yes)' : m.time_contribution === 'No' ? 'ના (No)' : '—',
            "Help Society (સમાજને મદદરૂપ)": m.help_society === 'Yes' ? 'હા (Yes)' : m.help_society === 'No' ? 'ના (No)' : '—',
            "Family Members (સભ્યો)": m.family_members_count || '1',
            "Special Notes (ખાસ નોંધ)": m.other?.notes || '—',
            "Consent (સંમતિ)": m.consent ? "YES" : "NO",
            "Submission Date & Time": m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }).toUpperCase() : '—',
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Members");
        XLSX.writeFile(workbook, `LALABAPA_SELECTED_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleBulkPDF = async () => {
        setIsGeneratingPDF(true);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const selectedMembers = members
            .filter(m => selectedIds.includes(m.id))
            .sort((a, b) => {
                const idA = a.member_id || '';
                const idB = b.member_id || '';
                return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
            });

        for (let i = 0; i < selectedMembers.length; i++) {
            const member = selectedMembers[i];
            const element = document.getElementById(`print-card-${member.id}`);
            if (element) {
                const canvas = await html2canvas(element, { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });
                const imgData = canvas.toDataURL('image/png', 1.0);
                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
            }
        }

        pdf.save(`LALABAPA_MEMBERS_CARDS_${new Date().getTime()}.pdf`);
        setIsGeneratingPDF(false);
    };

    const toggleImportant = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, "members", id), {
                isImportant: !currentStatus
            });
            fetchMembers();
        } catch (err) {
            console.error("Error updating status:", err);
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

    const toggleSelectMember = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === currentEntries.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(currentEntries.map(m => m.id));
        }
    };

    const filteredMembers = members.filter(m => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = !search || (
            m.main_member?.toLowerCase().includes(search) ||
            m.contact?.mobile?.includes(search) ||
            m.member_id?.toLowerCase().includes(search) ||
            m.address?.society?.toLowerCase().includes(search) ||
            m.address?.area?.toLowerCase().includes(search) ||
            m.address?.custom_area?.toLowerCase().includes(search) ||
            m.address?.custom_village_city?.toLowerCase().includes(search)
        );

        const matchesArea = filterArea === 'All' || m.address?.area === filterArea;
        const matchesGender = filterGender === 'All' || m.other?.gender === filterGender;
        const matchesImportant = !filterImportant || m.isImportant;

        return matchesSearch && matchesArea && matchesGender && matchesImportant;
    });

    const areas = ['All', ...new Set(members.map(m => m.address?.area).filter(Boolean))];

    // Pagination Logic
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEntries = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when filters change
    }, [searchTerm, filterArea, filterGender, filterImportant, itemsPerPage]);

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
                        <NavItem to="/pap" active={location.pathname === '/pap'} icon={<LayoutGrid className="w-4 h-4" />} label="OVERVIEW" />
                        <NavItem to="/pap/members" active={location.pathname === '/pap/members'} icon={<Users className="w-4 h-4" />} label="MEMBERS LIST" />
                        <NavItem to="/pap/settings" active={location.pathname === '/pap/settings'} icon={<SettingsIcon className="w-4 h-4" />} label="SETTINGS" />
                    </nav>
                </div>
                
                <div className="mt-auto p-6 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-bold text-xs uppercase tracking-widest">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Section */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-40 gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">સભ્યોની યાદી (Members List)</h1>
                        <p className="text-lalabapa-red text-[10px] uppercase font-black tracking-widest mt-0.5">Database Management & Export Panel</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button onClick={exportToExcel} className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 rounded-lg font-extrabold border-2 border-gray-100 hover:border-lalabapa-red/20 transition-all text-[10px] uppercase tracking-widest">
                            <Download className="w-4 h-4" /> EXPORT EXCEL
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto pb-32 md:pb-8">
                    {/* Filters & Search Bar */}
                    <div className="bg-white p-4 md:p-6 rounded-3xl border-2 border-gray-100 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-5 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="SEARCH BY NAME, ID, MOBILE, AREA..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-2xl text-xs font-black focus:bg-white focus:border-lalabapa-red focus:ring-4 focus:ring-lalabapa-red/5 outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                            
                            <div className="md:col-span-7 flex flex-wrap items-center gap-3">
                                <select
                                    value={filterArea}
                                    onChange={(e) => setFilterArea(e.target.value)}
                                    className="flex-1 md:flex-none px-4 py-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:bg-white focus:border-blue-500"
                                >
                                    <option value="All">All Areas (વિસ્તાર)</option>
                                    {areas.filter(a => a !== 'All').map(area => <option key={area} value={area}>{area}</option>)}
                                </select>
                                
                                <select
                                    value={filterGender}
                                    onChange={(e) => setFilterGender(e.target.value)}
                                    className="flex-1 md:flex-none px-4 py-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:bg-white focus:border-pink-500"
                                >
                                    <option value="All">All Genders</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>

                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="flex-1 md:flex-none px-4 py-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:bg-white focus:border-purple-500"
                                >
                                    <option value={50}>50 per page</option>
                                    <option value={100}>100 per page</option>
                                    <option value={1000}>Show All</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-2 border-t border-gray-50 mt-2">
                             <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 cursor-pointer uppercase tracking-widest hover:text-lalabapa-red transition-colors group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={filterImportant}
                                        onChange={(e) => setFilterImportant(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-100 rounded-full peer peer-checked:bg-lalabapa-red/10 transition-all border border-gray-200"></div>
                                    <div className="absolute top-1 left-1 w-3 h-3 bg-gray-300 rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-lalabapa-red"></div>
                                </div>
                                STARRED ONLY (મહત્વપૂર્ણ)
                            </label>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-5 w-12">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-gray-300 text-lalabapa-red focus:ring-lalabapa-red"
                                                checked={selectedIds.length === currentEntries.length && currentEntries.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-5 w-16 text-center">SR.</th>
                                        <th className="px-6 py-5">CUSTOMER / MEMBER</th>
                                        <th className="px-6 py-5">CONTACT</th>
                                        <th className="px-6 py-5">LOCATION</th>
                                        <th className="px-6 py-5">JOINED</th>
                                        <th className="px-6 py-5 text-right">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentEntries.map((m, index) => (
                                        <tr key={m.id} onClick={() => navigate(`/pap/members/${m.id}`)} className="group cursor-pointer hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-gray-300 text-lalabapa-red focus:ring-lalabapa-red"
                                                    checked={selectedIds.includes(m.id)}
                                                    onChange={() => toggleSelectMember(m.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-gray-400 font-mono text-center text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-500 text-xs">
                                                        {(m.main_member?.[0] || 'M').toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 gujarati text-base leading-tight">{m.main_member}</span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-lalabapa-red font-black tracking-wider uppercase">
                                                                {m.member_id || `ID: ${m.id.substring(0, 5).toUpperCase()}`}
                                                            </span>
                                                            {m.other?.role && (
                                                                <>
                                                                    <span className="text-gray-300">•</span>
                                                                    <span className="text-[9px] text-gray-500 font-bold gujarati uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded-md">
                                                                        {m.other.role}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-600 font-bold text-xs">{m.contact?.mobile}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-bold gujarati text-sm line-clamp-1">{m.address?.society}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold gujarati uppercase tracking-widest">{m.address?.area}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-[10px] font-mono leading-relaxed text-gray-500">
                                                {m.createdAt?.toDate ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{m.createdAt.toDate().toLocaleDateString('en-GB')}</span>
                                                        <span className="text-lalabapa-red">
                                                            {m.createdAt.toDate().toLocaleTimeString('en-US', { 
                                                                hour: '2-digit', 
                                                                minute: '2-digit', 
                                                                second: '2-digit', 
                                                                hour12: true 
                                                            })}
                                                        </span>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {m.isImportant && <Star className="w-4 h-4 fill-amber-500 text-amber-500" />}
                                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-lalabapa-red transition-colors" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredMembers.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                        <Search className="w-8 h-8 text-gray-200" />
                                                    </div>
                                                    <p className="gujarati text-gray-400 font-medium">કોઈ માહિતી મળી નથી (No results found)</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="px-6 py-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredMembers.length)} of {filteredMembers.length}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-100 bg-white hover:border-lalabapa-red/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-1.5 mx-2">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1
                                                        ? 'bg-lalabapa-red text-white shadow-lg shadow-red-500/20'
                                                        : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-gray-200'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-100 bg-white hover:border-lalabapa-red/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bulk Action Bar */}
                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-md text-white px-6 md:px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 md:gap-16 z-50 border border-white/10 no-print max-w-[90vw]"
                        >
                            <div className="flex flex-col shrink-0">
                                <span className="text-2xl font-black text-lalabapa-gold-primary leading-none">{selectedIds.length}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Selected</span>
                            </div>
                            <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                                <button 
                                    onClick={handleBulkPDF} 
                                    disabled={isGeneratingPDF}
                                    className="flex-shrink-0 flex items-center gap-2 px-6 py-4 bg-white text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-50"
                                >
                                    {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    PDF
                                </button>
                                <button 
                                    onClick={handleBulkExportExcel}
                                    className="flex-shrink-0 flex items-center gap-2 px-6 py-4 bg-gray-800 text-gray-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-700 transition-all"
                                >
                                    Excel
                                </button>
                                <button 
                                    onClick={() => setSelectedIds([])}
                                    className="shrink-0 px-4 py-4 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Off-screen Template for PDF Printing */}
                <div className="absolute top-[-9999px] left-[-9999px] z-[-9999] pointer-events-none" aria-hidden="true">
                    {members
                        .filter(m => selectedIds.includes(m.id))
                        .sort((a, b) => {
                            const idA = a.member_id || '';
                            const idB = b.member_id || '';
                            return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
                        })
                        .map(m => (
                        <div 
                            key={`print-${m.id}`} 
                            id={`print-card-${m.id}`} 
                            className="font-inter w-[210mm] min-h-[297mm] p-[12mm] flex flex-col relative" 
                            style={{ backgroundColor: '#ffffff' }}
                        >

                            
                            <header className="flex items-center justify-between mb-4 pb-3 border-b-4 border-lalabapa-red relative z-10 gap-4">
                                <div className="flex items-center gap-6">
                                    <img src="/logo.png" className="w-20 h-20 object-contain" alt="logo" />
                                    <div>
                                        <h1 className="gujarati text-xl font-black text-lalabapa-red leading-tight whitespace-nowrap">શ્રી લાલાબાપા સેવા સમિતિ - વાડજ, અમદાવાદ</h1>
                                        <p className="gujarati text-[10px] font-bold text-lalabapa-gold-primary uppercase tracking-widest mt-1">Shri Lalabapa Seva Samiti - Vadaj, Ahmedabad</p>
                                        <p className="gujarati text-[9px] font-black text-[#374151] mt-0.5">Trust Reg. No: A/5366/Ahmedabad</p>
                                    </div>
                                </div>
                                <div className="text-right bg-red-50 border-2 border-lalabapa-red border-dashed rounded-xl p-3 min-w-[140px]">
                                    <p className="text-[10px] font-black uppercase text-[#b96666] tracking-widest mb-0.5">Member ID</p>
                                    <p className="text-lg font-black text-lalabapa-red">{m.member_id || `SLB-VDJ-${m.id.substring(0, 5).toUpperCase()}`}</p>
                                </div>
                            </header>
                            
                            <div className="space-y-4 flex-1 relative z-10">
                                {/* Member Details Grid */}
                                <div className="border-2 border-[#f3e6e6] rounded-xl overflow-hidden">
                                    {/* Name Row */}
                                    <div className="bg-[#fcfafa] border-b-2 border-[#f3e6e6] p-4">
                                        <p className="gujarati text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">સભ્યનું નામ (Member Full Name)</p>
                                        <p className="gujarati text-2xl font-black text-[#111827]">{m.main_member}</p>
                                    </div>

                                    <div className="grid grid-cols-4 border-b-2 border-[#f3e6e6]">
                                        <div className="p-3 border-r-2 border-[#f3e6e6] col-span-1"><PrintItem label="જન્મ તારીખ (DOB)" value={m.other?.dob ? m.other.dob.split('-').reverse().join('/') : '—'} /></div>
                                        <div className="p-3 border-r-2 border-[#f3e6e6] col-span-1"><PrintItem label="લિંગ (Gender)" value={m.other?.gender} /></div>
                                        <div className="p-3 border-r-2 border-[#f3e6e6] col-span-1"><PrintItem label="સમાજમાં ભૂમિકા (Society Role)" value={m.other?.role} isGujarati /></div>
                                        <div className="p-3 col-span-1"><PrintItem label="પરિવાર સંખ્યા (Family)" value={m.family_members_count} /></div>
                                    </div>

                                    <div className="grid grid-cols-4 border-b-2 border-[#f3e6e6]">
                                        <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="મોબાઇલ ૧ (Mobile 1)" value={m.contact?.mobile} /></div>
                                        <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="મોબાઇલ ૨ (Mobile 2)" value={m.contact?.mobile2} /></div>
                                        <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="વોટ્સએપ (WhatsApp)" value={m.contact?.whatsapp} /></div>
                                        <div className="p-3"><PrintItem label="ઈ-મેઈલ (Email)" value={m.contact?.email} /></div>
                                    </div>

                                    <div className="p-4 border-b-2 border-[#f3e6e6] bg-[#fcfafa]">
                                        <p className="gujarati text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">સરનામું (Full Address)</p>
                                        <p className="gujarati text-sm font-bold text-[#111827] leading-relaxed">
                                            {[
                                                m.address?.house_no,
                                                m.address?.society,
                                                m.address?.landmark,
                                                m.address?.area === 'Other' ? m.address?.custom_area : m.address?.area,
                                                m.address?.village_city === 'Other' ? m.address?.custom_village_city : m.address?.village_city,
                                                m.address?.pincode
                                            ].filter(p => p && p.toString().trim() !== '').join(', ') || '—'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2">
                                        <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="વ્યવસાય (Occupation)" value={m.occupation} isGujarati /></div>
                                        <div className="p-3"><PrintItem label="વ્યવસાય વિગત (Details)" value={m.occupation_detail} isGujarati /></div>
                                    </div>
                                    <div className="grid grid-cols-2 bg-[#fcfafa] border-t-2 border-[#f3e6e6]">
                                        <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="સમયનું યોગદાન (Contribution)" value={m.time_contribution === 'Yes' ? 'હા (Yes)' : 'ના (No)'} isGujarati /></div>
                                        <div className="p-3"><PrintItem label="સમાજ સેવા (Society Help)" value={m.help_society === 'Yes' ? 'હા (Yes)' : 'ના (No)'} isGujarati /></div>
                                    </div>
                                    <div className="p-4 bg-white border-t-2 border-[#f3e6e6]">
                                        <p className="gujarati text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">ખાસ નોંધ (Special Notes)</p>
                                        <p className="gujarati text-[13px] font-bold text-[#111827] leading-relaxed whitespace-pre-wrap">{m.other?.notes || '—'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* System Footer */}
                            <div className="mt-8 pt-6 border-t-[3px] border-dashed border-gray-300 flex justify-between items-end relative z-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Added On</p>
                                    <p className="text-base font-bold text-gray-800 mt-1 bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                                        {m.createdAt?.toDate ? `${m.createdAt.toDate().toLocaleDateString('en-GB')} at ${m.createdAt.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
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
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}>
        {icon}
        {label}
    </Link>
);

const PrintItem = ({ label, value, isGujarati }) => (
    <div className="flex flex-col gap-0.5 w-full">
        <label className="gujarati text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-tight">{label}</label>
        <span className={`${isGujarati ? 'gujarati text-[16px]' : 'text-[14px]'} font-extrabold text-[#111827] leading-tight break-words`}>{value || '—'}</span>
    </div>
);

export default MembersList;
