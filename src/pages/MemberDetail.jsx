import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { 
  ChevronLeft, Star, Edit, Trash, MessageCircle, 
  Printer, Download, X, Check, User, Phone, MapPin, 
  Notebook, Mail, Users, Flag, Info, LayoutGrid, PlusCircle, Settings as SettingsIcon, LogOut, Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const AHMEDABAD_AREAS = [
    "Other", "Acher", "Adalaj", "Ambawadi", "Ambli", "Ambli Bopal", "Amraiwadi", "Asarwa", "Aslali",
    "Bapunagar", "Bareja", "Bavla", "Behrampura", "Bhadaj", "Bhat", "Bodakdev", "Bopal", "South Bopal",
    "Chanakyapuri", "Chandkheda", "New Chandkheda / Nava Chandkheda", "Chandlodia", "New Chandlodia / Nava Chandlodia", "Changodar", "Chharodi",
    "Dani Limda", "New Dani Limda / Nava Dani Limda", "Dariapur", "Daskroi", "Dholka", "Dudheshwar", "Ellis Bridge",
    "Fatehwadi", "Ghatlodia", "New Ghatlodia / Nava Ghatlodia", "Ghuma", "Girdharnagar", "Gomtipur", "Gota", "New Gota / Nava Gota",
    "Hansol", "Hatkeshwar", "New Hatkeshwar / Nava Hatkeshwar", "Hathijan", "Hebatpur", "Isanpur", "New Isanpur / Nava Isanpur",
    "Jagatpur", "Jamalpur", "Jivraj Park", "Jodhpur", "New Jodhpur / Nava Jodhpur", "Juhapura", "Kalupur", "Kankaria",
    "Kathwada", "Khadia", "Khanpur", "Khokhra", "New Khokhra / Nava Khokhra", "Koba", "Kotarpur", "Kubernagar",
    "Lambha", "New Lambha / Nava Lambha", "Makarba", "Maninagar", "New Maninagar / Nava Maninagar", "Memnagar", "Meghaninagar", "Motera",
    "New Motera / Nava Motera", "Nana Chiloda", "Nandej", "Naranpura", "New Naranpura / Nava Naranpura", "Naroda", "New Naroda / Nava Naroda",
    "Narol", "New Narol / Nava Narol", "Navrangpura", "Nikol", "New Nikol / Nava Nikol", "Ranip", "New Ranip / Nava Ranip", "Odhav", "New Odhav / Nava Odhav",
    "Paldi", "New Paldi / Nava Paldi", "Piplaj", "Prahlad Nagar", "New Prahlad Nagar / Nava Prahlad Nagar", "Raipur", "Rakhial", "Ramol",
    "New Ramol / Nava Ramol", "Sabarmati", "New Sabarmati / Nava Sabarmati", "Sanand", "Sarkhej", "New Sarkhej / Nava Sarkhej", "Saraspur", "Satellite",
    "New Satellite / Nava Satellite", "Science City", "SG Highway", "Shah-e-Alam", "Shahibaug", "New Shahibaug / Nava Shahibaug", "Shela",
    "Shilaj", "Sola", "Sardar Nagar", "Thaltej", "New Thaltej / Nava Thaltej", "Tragad", "Usmanpura", "New Usmanpura / Nava Usmanpura",
    "Vadaj", "Old Vadaj", "New Vadaj / Nava Vadaj", "Vasna", "New Vasna / Nava Vasna", "Vastral", "New Vastral / Nava Vastral", "Vastrapur",
    "New Vastrapur / Nava Vastrapur", "Vatva", "New Vastva / Nava Vatva", "Vejalpur", "New Vejalpur / Nava Vejalpur", "Viramgam", "Zundal", "New Zundal / Nava Zundal"
];

const MemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [member, setMember] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const formatDateDisplay = (dateStr) => {
        if (!dateStr || !dateStr.includes('-')) return dateStr || '—';
        try {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        } catch (e) {
            return dateStr;
        }
    };

    const updateNestedField = (path, value) => {
        setFormData(prev => {
            const newFormData = { ...prev };
            const parts = path.split('.');
            let current = newFormData;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = { ...current[parts[i]] };
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return newFormData;
        });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchMember();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [id]);

    const fetchMember = async () => {
        try {
            const memberRef = doc(db, "members", id);
            const memberSnap = await getDoc(memberRef);
            
            if (memberSnap.exists()) {
                setMember(memberSnap.data());
                setFormData(memberSnap.data());
            }

            // Family history listener
            const familyQuery = query(
                collection(db, "members", id, "history"),
                orderBy("createdAt", "desc")
            );
            
            const unsubscribeHistory = onSnapshot(familyQuery, (snapshot) => {
                setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });

            setLoading(false);
            return unsubscribeHistory;
        } catch (err) {
            console.error("Error fetching member:", err);
            setLoading(false);
        }
    };

    const toggleImportant = async () => {
        const docRef = doc(db, "members", id);
        await updateDoc(docRef, { isImportant: !member.isImportant });
        setMember(prev => ({ ...prev, isImportant: !prev.isImportant }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, "members", id), {
                ...formData,
                updatedAt: serverTimestamp()
            });
            setMember(formData);
            setIsEditing(false);
        } catch (err) {
            console.error("Save error:", err);
            alert("Error saving data");
        } finally {
            setIsSaving(false);
        }
    };

    const addNote = async () => {
        if (!newNote.trim()) return;
        const notesRef = collection(db, "members", id, "history");
        await addDoc(notesRef, {
            text: newNote,
            createdAt: serverTimestamp(),
            createdBy: auth.currentUser?.email || 'Admin'
        });
        setNewNote('');
    };

    const deleteNote = async (noteId) => {
        if (!window.confirm("આ નોંધ ડિલીટ કરવી છે?")) return;
        await deleteDoc(doc(db, "members", id, "history", noteId));
    };

    const deleteMember = async () => {
        if (window.confirm("Are you sure you want to delete this member?")) {
            try {
                await deleteDoc(doc(db, "members", id));
                navigate('/pap/members');
            } catch (err) {
                console.error("Delete error:", err);
            }
        }
    };

    const handleHide = async () => {
        if (!window.confirm("આ સભ્યને લિસ્ટમાંથી હટાવવા છે? (Hide this member?)")) return;
        try {
            const docRef = doc(db, "members", id);
            await updateDoc(docRef, { isActive: false });
            navigate('/pap/members');
        } catch (err) {
            console.error("Hide error:", err);
            alert("ભૂલ: માહિતી અપડેટ થઈ શકી નથી.");
        }
    };

    const handleDownloadPDF = async () => {
        setIsSaving(true);
        try {
            const element = document.getElementById('pdf-template');
            
            // Generate canvas with exact A4 dimensions at high scaling for crisp text
            const canvas = await html2canvas(element, {
                scale: 2, 
                useCORS: true, 
                logging: false, 
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            // A4 dimensions in mm: 210 x 297
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${member?.main_member || 'Member'}_${member?.member_id || member?.id?.substring(0,5)}.pdf`);
        } catch (error) {
            console.error("PDF generation error:", error);
            alert("Error downloading PDF.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/91${member?.contact?.whatsapp || member?.contact?.mobile}`, '_blank');
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/pap/login');
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-400 gujarati font-medium">માહિતી લોડ થઈ રહી છે...</div>;
    if (!member) return <div className="p-12 text-center text-red-500 gujarati font-medium">સભ્ય મળ્યા નથી</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex font-inter">
            {/* Sidebar (Desktop Only) */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex h-screen sticky top-0 no-print">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-10">
                        <img src="/logo.png" className="w-12 h-12 object-contain mix-blend-multiply drop-shadow-sm" alt="logo" />
                        <h2 className="gujarati text-xl font-black text-gray-900 leading-none">શ્રી લાલાબાપા સેવા સમિતિ</h2>
                    </div>
                    <nav className="space-y-1">
                        <NavItem to="/pap" active={location.pathname === '/pap'} icon={<LayoutGrid className="w-4 h-4" />} label="OVERVIEW" />
                        <NavItem to="/pap/members" active={location.pathname.startsWith('/pap/members')} icon={<Users className="w-4 h-4" />} label="MEMBERS LIST" />
                        <NavItem to="/pap/settings" active={location.pathname === '/pap/settings'} icon={<SettingsIcon className="w-4 h-4" />} label="SETTINGS" />
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
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-40 gap-4 no-print">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                                <span className="gujarati">{formData.main_member}</span>
                                {member.isImportant && <Star className="w-5 h-5 fill-amber-500 text-amber-500" />}
                            </h1>
                            <p className="text-lalabapa-red text-[10px] uppercase font-black tracking-widest mt-0.5">
                                MEMBER ID: {member.member_id || `SLB-VDJ-${member.id.substring(0, 5).toUpperCase()}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <button 
                            onClick={handleWhatsApp}
                            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#128C7E] transition-all shadow-lg shadow-green-500/20"
                        >
                            <MessageCircle className="w-4 h-4" /> WhatsApp
                        </button>
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 ${isEditing ? 'bg-lalabapa-red text-white shadow-lalabapa-red/20' : 'bg-gray-100 text-gray-700'} rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg`}
                        >
                            {isEditing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit className="w-4 h-4" /> Edit Profile</>}
                        </button>
                        {isEditing && (
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                            </button>
                        )}
                        <button 
                            onClick={() => window.print()}
                            className="flex-shrink-0 p-3 bg-white border-2 border-gray-100 text-gray-400 rounded-xl hover:text-gray-900 transition-all"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleHide}
                            className="flex-shrink-0 p-3 bg-red-50 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                            <Trash className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleDownloadPDF}
                            disabled={isSaving}
                            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-12 space-y-8 max-w-6xl mx-auto pb-32 md:pb-12 no-print">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Primary Identity */}
                            <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <DetailField label="FULL NAME (નામ)" value={formData.main_member} isEditing={isEditing} onChange={(v) => updateNestedField('main_member', v.toUpperCase())} isGujarati />
                                    <DetailField label="MEMBER ID" value={formData.member_id} isEditing={isEditing} onChange={(v) => updateNestedField('member_id', v.toUpperCase())} />
                                    <DetailField label="FAMILY MEMBERS" value={formData.family_members_count} isEditing={isEditing} onChange={(v) => updateNestedField('family_members_count', Number(v))} type="number" />
                                    <DetailField 
                                        label="JOINED DATE" 
                                        value={member.createdAt?.toDate ? (
                                            `${member.createdAt.toDate().toLocaleDateString('en-GB')}, ${member.createdAt.toDate().toLocaleTimeString('en-US', { 
                                                hour: '2-digit', 
                                                minute: '2-digit', 
                                                second: '2-digit', 
                                                hour12: true 
                                            })}`
                                        ) : '—'} 
                                        disabled 
                                    />
                                </div>
                            </div>

                            {/* Contact & Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                                    <SectionHeader title="CONTACT INFO" icon={<Phone className="w-4 h-4" />} />
                                    <div className="space-y-4">
                                        <DetailField label="MOBILE" value={formData?.contact?.mobile} isEditing={isEditing} onChange={(v) => updateNestedField('contact.mobile', v)} />
                                        <DetailField label="WHATSAPP" value={formData?.contact?.whatsapp} isEditing={isEditing} onChange={(v) => updateNestedField('contact.whatsapp', v)} />
                                        <DetailField label="MOBILE 2" value={formData?.contact?.mobile2} isEditing={isEditing} onChange={(v) => updateNestedField('contact.mobile2', v)} />
                                        <DetailField label="EMAIL" value={formData?.contact?.email} isEditing={isEditing} onChange={(v) => updateNestedField('contact.email', v)} />
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                                    <SectionHeader title="LOCATION INFO" icon={<MapPin className="w-4 h-4" />} />
                                    <div className="space-y-4">
                                        <DetailField 
                                            label="AREA" 
                                            value={formData?.address?.area} 
                                            isEditing={isEditing} 
                                            onChange={(v) => updateNestedField('address.area', v)} 
                                            type="select" 
                                            options={AHMEDABAD_AREAS} 
                                        />
                                        { (isEditing || formData?.address?.area === 'Other') && (
                                            <DetailField 
                                                label="CUSTOM AREA" 
                                                value={formData?.address?.custom_area} 
                                                isEditing={isEditing} 
                                                onChange={(v) => updateNestedField('address.custom_area', v.toUpperCase())} 
                                            />
                                        )}
                                        <DetailField 
                                            label="VILLAGE / CITY" 
                                            value={!isEditing && formData?.address?.village_city === 'Other' ? formData?.address?.custom_village_city : formData?.address?.village_city} 
                                            isEditing={isEditing} 
                                            onChange={(v) => updateNestedField('address.village_city', v)} 
                                            type="select" 
                                            options={['Ahmedabad', 'Other']} 
                                        />
                                        { (isEditing && formData?.address?.village_city === 'Other') && (
                                            <DetailField 
                                                label="CUSTOM CITY" 
                                                value={formData?.address?.custom_village_city} 
                                                isEditing={isEditing} 
                                                onChange={(v) => updateNestedField('address.custom_village_city', v.toUpperCase())} 
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Full Address */}
                            <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-sm">
                                <SectionHeader title="FULL ADDRESS" icon={<MapPin className="w-4 h-4" />} />
                                {!isEditing ? (
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none">COMPLETE ADDRESS</p>
                                        <p className="gujarati text-xl font-bold text-gray-800 leading-relaxed">
                                            {[
                                                formData?.address?.house_no,
                                                formData?.address?.society,
                                                formData?.address?.landmark,
                                                formData?.address?.area === 'Other' ? formData?.address?.custom_area : formData?.address?.area,
                                                formData?.address?.village_city === 'Other' ? formData?.address?.custom_village_city : formData?.address?.village_city,
                                                formData?.address?.pincode
                                            ].filter(p => p && p.toString().trim() !== '').join(', ') || '—'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <DetailField label="HOUSE NO." value={formData?.address?.house_no} isEditing={isEditing} onChange={(v) => updateNestedField('address.house_no', v.toUpperCase())} />
                                        <DetailField label="SOCIETY" value={formData?.address?.society} isEditing={isEditing} onChange={(v) => updateNestedField('address.society', v.toUpperCase())} />
                                        <DetailField label="LANDMARK" value={formData?.address?.landmark} isEditing={isEditing} onChange={(v) => updateNestedField('address.landmark', v.toUpperCase())} />
                                        <DetailField label="PIN CODE" value={formData?.address?.pincode} isEditing={isEditing} onChange={(v) => updateNestedField('address.pincode', v)} />
                                    </div>
                                )}
                            </div>

                            {/* Official Details */}
                            <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-sm">
                                <SectionHeader title="OFFICIAL DETAILS" icon={<Info className="w-4 h-4" />} />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <DetailField label="GENDER" value={formData?.other?.gender} isEditing={isEditing} onChange={(v) => updateNestedField('other.gender', v)} type="select" options={['Male', 'Female', 'Other']} />
                                    <DetailField label="DOB" value={formData?.other?.dob} isEditing={isEditing} onChange={(v) => updateNestedField('other.dob', v)} type="date" />
                                    <DetailField label="SOCIETY ROLE" value={formData?.other?.role} isEditing={isEditing} onChange={(v) => updateNestedField('other.role', v.toUpperCase())} />
                                    <DetailField 
                                        label="OCCUPATION" 
                                        value={formData?.occupation} 
                                        isEditing={isEditing} 
                                        onChange={(v) => updateNestedField('occupation', v)} 
                                        type="select" 
                                        options={['વ્યવસાય', 'ધંધો', 'નોકરી', 'અભ્યાસ']} 
                                    />
                                    <DetailField 
                                        label="OCCUPATION DETAIL" 
                                        value={formData?.occupation_detail} 
                                        isEditing={isEditing} 
                                        onChange={(v) => updateNestedField('occupation_detail', v)} 
                                    />
                                    <DetailField 
                                        label="TIME CONTRIBUTION" 
                                        value={formData?.time_contribution} 
                                        isEditing={isEditing} 
                                        onChange={(v) => updateNestedField('time_contribution', v)} 
                                        type="select" 
                                        options={['Yes', 'No']} 
                                    />
                                    <DetailField 
                                        label="HELP SOCIETY" 
                                        value={formData?.help_society} 
                                        isEditing={isEditing} 
                                        onChange={(v) => updateNestedField('help_society', v)} 
                                        type="select" 
                                        options={['Yes', 'No']} 
                                    />
                                    <DetailField label="CONSENT" value={formData?.consent ? "GIVEN" : "NOT GIVEN"} disabled />
                                    <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-gray-50 mt-4">
                                        <DetailField 
                                            label="USER NOTES (FROM REGISTRATION)" 
                                            value={formData?.other?.notes} 
                                            isEditing={isEditing} 
                                            onChange={(v) => updateNestedField('other.notes', v)} 
                                            type="textarea"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Notes Side Panel */}
                        <div className="space-y-8">
                            <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 flex flex-col h-[600px] sticky top-32 shadow-sm">
                                <h3 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    <Notebook className="w-4 h-4" /> Admin Logs
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
                                    {notes.map(note => (
                                        <div key={note.id} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative group">
                                            <p className="gujarati text-sm text-gray-700 font-bold leading-relaxed">{note.text}</p>
                                            <button onClick={() => deleteNote(note.id)} className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-3 h-3" /></button>
                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{note.createdBy} • {note.createdAt?.toDate().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="relative pt-4 border-t border-gray-100">
                                    <textarea 
                                        value={newNote} 
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Add a private note..."
                                        className="w-full bg-gray-50 rounded-2xl p-4 text-xs font-bold focus:bg-white focus:border-lalabapa-red/50 outline-none transition-all resize-none h-24 border border-gray-50"
                                    />
                                    <button onClick={addNote} className="absolute bottom-6 right-4 p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg">
                                        <PlusCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-[-9999px] left-[-9999px] z-[-9999]" aria-hidden="true">
                    <div id="pdf-template" className="font-inter w-[210mm] min-h-[297mm] p-[12mm] flex flex-col relative" style={{ backgroundColor: '#ffffff' }}>

                        
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
                                <p className="text-lg font-black text-lalabapa-red">{member.member_id || `SLB-VDJ-${member.id.substring(0, 5).toUpperCase()}`}</p>
                            </div>
                        </header>
                        
                        <div className="space-y-4 flex-1 relative z-10">
                            {/* Member Details Grid */}
                            <div className="border-2 border-[#f3e6e6] rounded-xl overflow-hidden">
                                {/* Name Row */}
                                <div className="bg-[#fcfafa] border-b-2 border-[#f3e6e6] p-4">
                                    <p className="gujarati text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">સભ્યનું નામ (Member Full Name)</p>
                                    <p className="gujarati text-2xl font-black text-[#111827]">{formData.main_member}</p>
                                </div>

                                <div className="grid grid-cols-4 border-b-2 border-[#f3e6e6]">
                                    <div className="p-3 border-r-2 border-[#f3e6e6] col-span-1"><PrintItem label="જન્મ તારીખ (DOB)" value={formData?.other?.dob ? formData.other.dob.split('-').reverse().join('/') : '—'} /></div>
                                    <div className="p-3 border-r-2 border-[#f3e6e6] col-span-1"><PrintItem label="લિંગ (Gender)" value={formData?.other?.gender} /></div>
                                    <div className="p-3 border-r-2 border-[#f3e6e6] col-span-1"><PrintItem label="સમાજમાં ભૂમિકા (Society Role)" value={formData?.other?.role} isGujarati /></div>
                                    <div className="p-3 col-span-1"><PrintItem label="પરિવાર સંખ્યા (Family)" value={formData.family_members_count} /></div>
                                </div>

                                <div className="grid grid-cols-4 border-b-2 border-[#f3e6e6]">
                                    <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="મોબાઇલ ૧ (Mobile 1)" value={formData?.contact?.mobile} /></div>
                                    <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="મોબાઇલ ૨ (Mobile 2)" value={formData?.contact?.mobile2} /></div>
                                    <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="વોટ્સએપ (WhatsApp)" value={formData?.contact?.whatsapp} /></div>
                                    <div className="p-3"><PrintItem label="ઈ-મેઈલ (Email)" value={formData?.contact?.email} /></div>
                                </div>

                                <div className="p-4 border-b-2 border-[#f3e6e6] bg-[#fcfafa]">
                                    <p className="gujarati text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">સરનામું (Full Address)</p>
                                    <p className="gujarati text-sm font-bold text-[#111827] leading-relaxed">
                                        {[
                                            formData?.address?.house_no,
                                            formData?.address?.society,
                                            formData?.address?.landmark,
                                            formData?.address?.area === 'Other' ? formData?.address?.custom_area : formData?.address?.area,
                                            formData?.address?.village_city === 'Other' ? formData?.address?.custom_village_city : formData?.address?.village_city,
                                            formData?.address?.pincode
                                        ].filter(p => p && p.toString().trim() !== '').join(', ') || '—'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="વ્યવસાય (Occupation)" value={formData?.occupation} isGujarati /></div>
                                    <div className="p-3"><PrintItem label="વ્યવસાય વિગત (Details)" value={formData?.occupation_detail} isGujarati /></div>
                                </div>
                                <div className="grid grid-cols-2 bg-[#fcfafa] border-t-2 border-[#f3e6e6]">
                                    <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="સમયનું યોગદાન (Contribution)" value={formData?.time_contribution === 'Yes' ? 'હા (Yes)' : 'ના (No)'} isGujarati /></div>
                                    <div className="p-3"><PrintItem label="સમાજ સેવા (Society Help)" value={formData?.help_society === 'Yes' ? 'હા (Yes)' : 'ના (No)'} isGujarati /></div>
                                </div>
                                <div className="p-4 bg-white border-t-2 border-[#f3e6e6]">
                                    <p className="gujarati text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">ખાસ નોંધ (Special Notes)</p>
                                    <p className="gujarati text-[13px] font-bold text-[#111827] leading-relaxed whitespace-pre-wrap">{formData?.other?.notes || '—'}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* System Footer */}
                        <div className="mt-8 pt-6 border-t-[3px] border-dashed border-gray-300 flex justify-between items-end relative z-10">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Added On</p>
                                <p className="text-base font-bold text-gray-800 mt-1 bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                                    {member.createdAt?.toDate ? `${member.createdAt.toDate().toLocaleDateString('en-GB')} at ${member.createdAt.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] no-print">
                <Link to="/pap" className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/pap' ? 'text-lalabapa-red' : 'text-gray-400'}`}>
                    <LayoutGrid className="w-5 h-5" />
                    <span className="text-[10px] font-bold">OVERVIEW</span>
                </Link>
                <Link to="/pap/members" className={`flex flex-col items-center gap-1 transition-colors ${location.pathname.startsWith('/pap/members') ? 'text-lalabapa-red' : 'text-gray-400'}`}>
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

// Sub-components
const NavItem = ({ to, active, icon, label }) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold text-sm ${
        active ? 'bg-gray-100 text-gray-900 border-l-4 border-lalabapa-red pl-3' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
    }`}>
        {icon}
        {label}
    </Link>
);

const SectionHeader = ({ title, icon }) => (
    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-300 border-b border-gray-50 pb-4 flex items-center gap-2">
        {icon} {title}
    </h3>
);

const DetailField = ({ label, value, isEditing, onChange, type = "text", options = [], disabled = false, isGujarati = false }) => (
    <div className="space-y-2">
        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none">{label}</p>
        {!isEditing || disabled ? (
            <p className={`${isGujarati ? 'gujarati text-lg' : 'text-base font-bold'} text-gray-800 break-words leading-snug`}>{value || '—'}</p>
        ) : (
            type === "select" ? (
                <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-2xl text-xs font-black focus:bg-white focus:border-lalabapa-red outline-none transition-all uppercase tracking-widest"
                >
                    <option value="">SELECT...</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                </select>
            ) : type === "textarea" ? (
                <textarea
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-lalabapa-red outline-none transition-all resize-none"
                    placeholder="ENTER NOTES..."
                />
            ) : (
                <input
                    type={type}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-lalabapa-red outline-none transition-all"
                />
            )
        )}
    </div>
);

const PrintItem = ({ label, value, isGujarati }) => (
    <div className="flex flex-col gap-0.5 w-full">
        <label className="gujarati text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-tight">{label}</label>
        <span className={`${isGujarati ? 'gujarati text-[16px]' : 'text-[14px]'} font-extrabold text-[#111827] leading-tight break-words`}>{value || '—'}</span>
    </div>
);

export default MemberDetail;
