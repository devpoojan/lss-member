import { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, runTransaction, doc, getDoc } from 'firebase/firestore';
import { ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Loader2, Search, Check, User, Phone, MessageCircle, Info, MapPin, X, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- Constants & Helpers ---

const STEPS = [
    { id: 0, title: 'કુટુંબ સંખ્યા', subtitle: 'Family Count' },
    { id: 1, title: 'મુખ્ય સભ્ય માહિતી', subtitle: 'Main Info' },
    { id: 2, title: 'સરનામું', subtitle: 'Address' },
    { id: 3, title: 'અન્ય માહિતી', subtitle: 'Other Info' },
    { id: 4, title: 'ચકાસણી', subtitle: 'Summary' },
];

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
    "New Vastrapur / Nava Vastrapur", "Vatva", "New Vatva / Nava Vatva", "Vejalpur", "New Vejalpur / Nava Vejalpur", "Viramgam", "Zundal", "New Zundal / Nava Zundal"
];

// Removed area codes logic as per simple global ID request

const isEnglishName = (name) => /^[A-Za-z\s.]+$/.test(name);
const normalizeArea = (area) => area.toLowerCase().replace(/nava/gi, "New").replace(/\s+/g, "");

// --- Validation Schema ---

const joinSchema = z.object({
    family_members_count: z.string().min(1, 'સંખ્યા પસંદ કરો'),
    main_member: z.string()
        .min(1, 'નામ ખાલી ન રાખો')
        .refine(isEnglishName, 'કૃપા કરીને તમારું નામ અંગ્રેજી માં લખો')
        .refine(n => n.trim().split(" ").length >= 2, 'કૃપા કરીને સંપૂર્ણ નામ લખો (નામ + પિતાનું નામ + અટક)'),
    contact: z.object({
        mobile: z.string().length(10, 'મોબાઇલ નંબર ૧૦ અંકોનો હોવો જોઈએ').regex(/^\d+$/, 'ફક્ત અંકો જ માન્ય છે'),
        whatsapp: z.string().length(10, 'વોટ્સએપ નંબર ૧૦ અંકોનો હોવો જોઈએ').regex(/^\d+$/, 'ફક્ત અંકો જ માન્ય છે').optional().or(z.literal('')),
        mobile2: z.string().length(10, 'મોબાઇલ નંબર ૧૦ અંકોનો હોવો જોઈએ').regex(/^\d+$/, 'ફક્ત અંકો જ માન્ય છે').optional().or(z.literal('')),
        email: z.string().email('સાચું ઈમેલ સરનામું લખો').optional().or(z.literal('')),
    }),
    occupation: z.string().min(1, 'વ્યવસાય પસંદ કરો'),
    occupation_detail: z.string().optional().or(z.literal('')),
    time_contribution: z.string().optional(),
    help_society: z.string().optional(),
    address: z.object({
        house_no: z.string().min(1, 'ઘર નંબર લખો'),
        society: z.string().min(1, 'સોસાયટી/એપાર્ટમેન્ટનું નામ લખો'),
        landmark: z.string().optional(),
        area: z.string().min(1, 'વિસ્તાર પસંદ કરો'),
        custom_area: z.string().optional(),
        village_city: z.string().min(1, 'શહેર પસંદ કરો'),
        custom_village_city: z.string().optional(),
        pincode: z.string().length(6, 'પિનકોડ ૬ અંકનો હોવો જોઈએ').regex(/^\d+$/, 'ફક્ત અંકો જ માન્ય છે').optional().or(z.literal('')),
        district: z.string().min(1, 'જિલ્લો પસંદ કરો'),
        custom_district: z.string().optional(),
    }),
    other: z.object({
        dob: z.string().optional(),
        gender: z.string().optional(),
        role: z.string().optional(),
        notes: z.string().optional(),
    }),
    consent: z.boolean().refine(val => val === true, 'સંમતિ આપવી અનિવાર્ય છે (Consent is required)')
});

// --- Component ---

const JoinForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [areaSearch, setAreaSearch] = useState("");
    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
    const [memberID, setMemberID] = useState("");
    const [sameAsMobile, setSameAsMobile] = useState(false);
    const submittingRef = useRef(false);

    const { register, handleSubmit, formState: { errors }, trigger, watch, setValue, getValues } = useForm({
        resolver: zodResolver(joinSchema),
        mode: 'onBlur',
        defaultValues: {
            family_members_count: "1",
            main_member: "",
            contact: {
                mobile: "",
                whatsapp: "",
                mobile2: "",
                email: ""
            },
            occupation: "વ્યવસાય",
            occupation_detail: "",
            time_contribution: "",
            help_society: "",
            address: {
                house_no: "",
                society: "",
                landmark: "",
                area: "",
                custom_area: "",
                village_city: "Ahmedabad",
                custom_village_city: "",
                pincode: "",
                district: "Ahmedabad",
                custom_district: ""
            },
            other: {
                dob: "",
                gender: "Male",
                role: "",
                notes: ""
            },
            consent: false
        }
    });

    const watchCount = watch("family_members_count");
    const watchMobile = watch("contact.mobile");
    const watchArea = watch("address.area");
    const watchDistrict = watch("address.district");
    const watchCity = watch("address.village_city");
    const watchOccupation = watch("occupation");

    const handleDownloadPDF = async (data, generatedID) => {
        try {
            // Wait slightly for the hidden template to be ready with the new ID
            await new Promise(resolve => setTimeout(resolve, 500));
            const element = document.getElementById('pdf-template');
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${data.main_member || 'Member'}_Registration.pdf`);
        } catch (error) {
            console.error("PDF generation error:", error);
        }
    };

    // Sync WhatsApp with Mobile if "Same as Mobile" is checked
    useEffect(() => {
        if (sameAsMobile) {
            setValue('contact.whatsapp', watchMobile || "");
        }
    }, [watchMobile, sameAsMobile, setValue]);


    const filteredAreas = useMemo(() => {
        const search = normalizeArea(areaSearch);
        return AHMEDABAD_AREAS.filter(a => normalizeArea(a).includes(search));
    }, [areaSearch]);

    const nextStep = async () => {
        let fieldsToValidate = [];
        if (currentStep === 0) fieldsToValidate = ['family_members_count'];
        if (currentStep === 1) fieldsToValidate = ['main_member', 'contact.mobile', 'occupation'];
        if (currentStep === 2) {
            fieldsToValidate = ['address.house_no', 'address.society', 'address.area', 'address.pincode', 'address.district', 'address.village_city'];
            if (watchArea === 'Other') fieldsToValidate.push('address.custom_area');
            if (watchCity === 'Other') fieldsToValidate.push('address.custom_village_city');
        }
        if (currentStep === 3) fieldsToValidate = ['other.role', 'other.gender'];

        setError(null);
        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            setError("કૃપા કરીને ઉપરની ભૂલ(ઓ) સુધારો (Please fix errors above)");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const onSubmit = async (data) => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setIsSubmitting(true);
        setError(null);

        try {
            // Sanitize data (Remove undefined values for Firestore)
            const sanitize = (obj) => {
                const newObj = Array.isArray(obj) ? [] : {};
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    if (value === undefined) {
                        newObj[key] = ""; // Replace undefined with empty string
                    } else if (value !== null && typeof value === 'object') {
                        newObj[key] = sanitize(value);
                    } else {
                        newObj[key] = value;
                    }
                });
                return newObj;
            };

            let finalMemberID = "SLB-VDJ-0000";

            // Simple Sequential ID Generation via Transaction
            await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, "system", "counter");
                const counterSnap = await transaction.get(counterRef);

                let nextCount = 1;
                if (counterSnap.exists()) {
                    nextCount = counterSnap.data().count + 1;
                }

                transaction.set(counterRef, { count: nextCount }, { merge: true });
                finalMemberID = `SLB-VDJ-${nextCount.toString().padStart(4, '0')}`;
            });

            const docData = {
                ...sanitize(data),
                member_id: finalMemberID, // Simple LSS sequential ID
                isActive: true,
                isImportant: false,
                tags: [],
                submission_time: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                }),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await addDoc(collection(db, "members"), docData);
            setMemberID(finalMemberID); // Store for success screen
            setIsSuccess(true);
            
            // Trigger automatic PDF download with current form data and new ID
            handleDownloadPDF(data, finalMemberID);
        } catch (err) {
            console.error("Submission error:", err);
            setError("કંઈક ખોટું થયું છે. કૃપા કરીને ફરી પ્રયાસ કરો.");
        } finally {
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };


    const guardedSubmit = (e) => {
        if (submittingRef.current) {
            e.preventDefault();
            return;
        }
        
        if (currentStep < 4) {
            e.preventDefault();
            nextStep();
            return;
        }

        handleSubmit(onSubmit)(e);
    };

    return (
        <div className="min-h-screen bg-warm-white py-12 px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <img src="/logo.png" alt="Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto mb-4 drop-shadow-lg mix-blend-multiply" />
                    <h1 className="gujarati text-3xl md:text-5xl font-bold text-lalabapa-red mb-3 underline underline-offset-8 decoration-lalabapa-gold-primary/40">માહિતી સર્વે ફોર્મ</h1>
                    <p className="text-gray-500 mt-4 uppercase tracking-[0.2em] text-[10px] md:text-xs">Community Information Survey</p>
                </div>

                {/* Progress Bar */}
                <div className="flex justify-between items-center mb-12 px-4 overflow-x-auto pb-4 no-scrollbar">
                    {STEPS.map((step) => (
                        <div key={step.id} className="flex flex-col items-center flex-1 min-w-[80px] relative">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold z-10 transition-all duration-500 ${currentStep >= step.id ? 'bg-lalabapa-red text-warm-white scale-110 shadow-lg' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step.id + 1}
                            </div>
                            <span className={`gujarati mt-3 text-[10px] md:text-sm font-semibold transition-opacity duration-300 whitespace-nowrap ${currentStep === step.id ? 'opacity-100 text-lalabapa-red' : 'opacity-40 text-gray-400'}`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <form 
                    onSubmit={guardedSubmit} 
                    className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-lalabapa-gold-primary/20 relative overflow-hidden min-h-[400px] flex flex-col"
                >

                    <AnimatePresence mode="wait">
                        {/* STEP 0: Family Count */}
                        {currentStep === 0 && (
                            <motion.div key="step0" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                                <div className="title-box border-l-4 border-lalabapa-red pl-4">
                                    <h3 className="gujarati text-2xl font-bold text-lalabapa-red">કુટુંબના સભ્યોની સંખ્યા</h3>
                                    <p className="text-gray-400 text-sm uppercase tracking-widest leading-none mt-1">Number of Family Members</p>
                                </div>
                                <div className="max-w-xs mx-auto text-center">
                                    <label className="gujarati block text-gray-700 font-bold mb-4 text-lg">તમારા કુટુંબમાં કુલ કેટલા સભ્યો છે? <span className="text-lalabapa-red">*</span></label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        {...register('family_members_count')}
                                        className="w-40 px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-lalabapa-gold-primary focus:ring-4 focus:ring-lalabapa-gold-primary/10 transition-all outline-none bg-gray-50 text-3xl font-black text-center"
                                        placeholder="1"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest">Type the number of members</p>
                                    {errors.family_members_count && <p className="text-red-500 text-xs mt-2 text-center">{errors.family_members_count.message}</p>}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 1: Main Member Info (Merged Name Input) */}
                        {currentStep === 1 && (
                            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                <div className="title-box border-l-4 border-lalabapa-red pl-4">
                                    <h3 className="gujarati text-2xl font-bold text-lalabapa-red">મુખ્ય સભ્યની માહિતી</h3>
                                    <p className="text-gray-400 text-sm uppercase tracking-widest leading-none mt-1">Contact Details</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group md:col-span-2">
                                        <div className="mb-4 p-4 bg-lalabapa-gold-primary/5 rounded-2xl border-2 border-dashed border-lalabapa-gold-primary/20 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                                <Info className="w-5 h-5 text-lalabapa-gold-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-lalabapa-gold-primary/60 mb-0.5">Example Name (ઉદાહરણ)</p>
                                                <p className="gujarati text-lg font-black text-gray-800">Rameshbhai Chandubhai Vaghela</p>
                                            </div>
                                        </div>
                                        <label className="gujarati block text-gray-700 font-bold mb-2 text-lg">મુખ્ય સભ્યનું નામ (અંગ્રેજીમાં) <span className="text-lalabapa-red">*</span></label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                {...register('main_member')}
                                                onChange={(e) => setValue('main_member', e.target.value.toUpperCase())}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-lalabapa-gold-primary focus:ring-4 focus:ring-lalabapa-gold-primary/10 outline-none transition-all font-bold text-lg uppercase"
                                                placeholder="ENTER FULL NAME HERE"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 italic gujarati">કૃપા કરીને નામ આ રીતે લખો: નામ + પિતાનું નામ + અટક</p>
                                        {errors.main_member && <p className="text-red-500 text-sm mt-1 font-bold">{errors.main_member.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="gujarati block text-gray-700 font-bold mb-2 text-lg">MOBILE NUMBER <span className="text-lalabapa-red">*</span></label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input {...register('contact.mobile')} className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-lalabapa-gold-primary focus:ring-4 focus:ring-lalabapa-gold-primary/10 outline-none transition-all font-bold text-lg" placeholder="૧૦ અંકનો નંબર" />
                                        </div>
                                        {errors.contact?.mobile && <p className="text-red-500 text-sm mt-1">{errors.contact.mobile.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="gujarati block text-gray-700 font-bold text-lg">WHATSAPP NUMBER (વૈકલ્પિક)</label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={sameAsMobile}
                                                        onChange={(e) => setSameAsMobile(e.target.checked)}
                                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-green-500 transition-all checked:bg-green-500" 
                                                    />
                                                    <Check className="absolute w-4 h-4 text-white scale-0 transition-transform peer-checked:scale-75 pointer-events-none" />
                                                </div>
                                                <span className="gujarati text-xs font-bold text-gray-500 group-hover:text-green-600 transition-colors pt-0.5">મોબાઈલ નંબર 1 જેવો જ</span>
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                                            <input 
                                                {...register('contact.whatsapp')} 
                                                readOnly={sameAsMobile}
                                                onChange={(e) => {
                                                    register('contact.whatsapp').onChange(e);
                                                    if (sameAsMobile && e.target.value !== watchMobile) {
                                                        setSameAsMobile(false);
                                                    }
                                                }}
                                                className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all outline-none font-bold text-lg ${sameAsMobile ? 'bg-gray-50 border-green-100 text-gray-500 cursor-not-allowed' : 'border-gray-100 focus:border-lalabapa-gold-primary focus:ring-4 focus:ring-lalabapa-gold-primary/10'}`} 
                                                placeholder={sameAsMobile ? watchMobile : "વોટ્સએપ નંબર"}
                                            />
                                        </div>
                                        {errors.contact?.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.contact.whatsapp.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="gujarati block text-gray-700 font-bold mb-2 text-lg">MOBILE NUMBER 2 (વૈકલ્પિક)</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 opacity-40" />
                                            <input {...register('contact.mobile2')} className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-lalabapa-gold-primary focus:ring-4 focus:ring-lalabapa-gold-primary/10 outline-none transition-all font-bold text-lg" placeholder="બીજો મોબાઇલ નંબર" />
                                        </div>
                                        {errors.contact?.mobile2 && <p className="text-red-500 text-sm mt-1">{errors.contact.mobile2.message}</p>}
                                    </div>
                                    <div className="form-group md:col-span-2">
                                        <label className="gujarati block text-gray-700 font-bold mb-2">ઈમેઇલ સરનામું (વૈકલ્પિક)</label>
                                        <input type="email" {...register('contact.email')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lalabapa-gold-primary focus:ring-2 focus:ring-lalabapa-gold-primary/20 outline-none" placeholder="example@email.com" />
                                        {errors.contact?.email && <p className="text-red-500 text-sm mt-1">{errors.contact.email.message}</p>}
                                    </div>
                                    <div className="form-group md:col-span-2 pt-4 border-t border-gray-50">
                                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                                            <div className="flex-1 space-y-3">
                                                <label className="gujarati block text-gray-800 font-black text-xl mb-2">આપ શું કરો છો? <span className="text-lalabapa-red">*</span></label>
                                                <div className="flex flex-wrap gap-3">
                                                    {['વ્યવસાય', 'ધંધો', 'નોકરી', 'અભ્યાસ'].map((opt) => (
                                                        <button 
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => {
                                                                setValue('occupation', opt);
                                                                setValue('occupation_detail', '');
                                                            }}
                                                            className={`px-6 py-3 rounded-xl font-bold gujarati transition-all border-2 ${watchOccupation === opt ? 'bg-lalabapa-red text-white border-lalabapa-red shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-lalabapa-gold-primary'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <label className="gujarati block text-gray-700 font-bold mb-2 text-lg">
                                                    આપ શું <span className="text-lalabapa-red text-lg font-black">{watchOccupation}</span> કરી રહ્યા છો?
                                                </label>
                                                <input 
                                                    {...register('occupation_detail')}
                                                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-lalabapa-gold-primary outline-none transition-all font-bold gujarati"
                                                    placeholder={`દા.ત. ${watchOccupation === 'અભ્યાસ' ? 'કોલેજ (Computer Science)' : watchOccupation === 'ધંધો' ? 'અનાજનો ધંધો' : 'સિવિલ એન્જિનિયર'}`}
                                                />
                                                {errors.occupation_detail && <p className="text-red-500 text-xs font-bold">{errors.occupation_detail.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group md:col-span-2 pt-4 border-t border-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="gujarati block text-gray-800 font-bold mb-2 text-sm leading-relaxed">શું આપ જ્ઞાતિ અને સમાજના કલ્યાણ માટે સમયનું યોગદાન કરશો?</label>
                                                <div className="flex gap-4">
                                                    {['Yes', 'No'].map(opt => (
                                                        <button 
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setValue("time_contribution", opt)}
                                                            className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${watch("time_contribution") === opt ? 'bg-lalabapa-red text-white border-lalabapa-red shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-lalabapa-gold-primary'}`}
                                                        >
                                                            {opt === 'Yes' ? 'હા (Yes)' : 'ના (No)'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="gujarati block text-gray-800 font-bold mb-2 text-sm leading-relaxed">સમાજને આગળ લાવવામાં આપ મદદરૂપ થશો?</label>
                                                <div className="flex gap-4">
                                                    {['Yes', 'No'].map(opt => (
                                                        <button 
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setValue("help_society", opt)}
                                                            className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${watch("help_society") === opt ? 'bg-lalabapa-red text-white border-lalabapa-red shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-lalabapa-gold-primary'}`}
                                                        >
                                                            {opt === 'Yes' ? 'હા (Yes)' : 'ના (No)'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Address Info */}
                        {currentStep === 2 && (
                            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                <div className="title-box border-l-4 border-lalabapa-red pl-4">
                                    <h3 className="gujarati text-2xl font-bold text-lalabapa-red">સરનામાંની માહિતી</h3>
                                    <p className="text-gray-400 text-sm uppercase tracking-widest leading-none mt-1">Address Details</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label className="gujarati block text-gray-700 font-bold mb-2 text-lg">HOUSE NO. <span className="text-lalabapa-red">*</span></label>
                                        <input {...register('address.house_no')} onChange={(e) => setValue('address.house_no', e.target.value.toUpperCase())} className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-lalabapa-gold-primary outline-none font-bold uppercase" placeholder="E.G. A/102" />
                                        {errors.address?.house_no && <p className="text-red-500 text-sm mt-1">{errors.address.house_no.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="gujarati block text-gray-700 font-bold mb-2 text-lg">SOCIETY / APARTMENT NAME <span className="text-lalabapa-red">*</span></label>
                                        <input {...register('address.society')} onChange={(e) => setValue('address.society', e.target.value.toUpperCase())} className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-lalabapa-gold-primary outline-none font-bold uppercase" placeholder="ENTER SOCIETY NAME" />
                                        {errors.address?.society && <p className="text-red-500 text-sm mt-1">{errors.address.society.message}</p>}
                                    </div>
                                    <div className="form-group md:col-span-2">
                                        <label className="gujarati block text-gray-700 font-bold mb-2">LANDMARK (આજુ બાજુની જગ્યા)</label>
                                        <input {...register('address.landmark')} onChange={(e) => setValue('address.landmark', e.target.value.toUpperCase())} className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-lalabapa-gold-primary outline-none font-bold uppercase" placeholder="E.G. NEAR HANUMAN TEMPLE" />
                                    </div>
                                    <div className="form-group flex flex-col">
                                        <label className="gujarati block text-gray-700 font-bold mb-2 text-lg">વિસ્તાર (Area) <span className="text-lalabapa-red">*</span></label>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsAreaModalOpen(true)}
                                            className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all group ${watchArea ? 'border-lalabapa-gold-primary/30 bg-lalabapa-gold-primary/5' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPin className={`w-5 h-5 ${watchArea ? 'text-lalabapa-gold-primary' : 'text-gray-300'}`} />
                                                <span className={`gujarati font-bold text-lg ${watchArea ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
                                                    {watchArea || "તમારો વિસ્તાર પસંદ કરો... (SELECT AREA)"}
                                                </span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        {errors.address?.area && <p className="text-red-500 text-sm mt-1">{errors.address.area.message}</p>}
                                    </div>
                                    {watchArea === 'Other' && (
                                        <div className="form-group md:col-span-2">
                                            <label className="gujarati block text-gray-700 font-bold mb-2">કૃપા કરીને તમારા વિસ્તારનું નામ લખો (TYPE AREA NAME) <span className="text-lalabapa-red">*</span></label>
                                            <input {...register('address.custom_area')} onChange={(e) => setValue('address.custom_area', e.target.value.toUpperCase())} className="w-full px-4 py-4 rounded-xl border-2 border-lalabapa-red/20 focus:border-lalabapa-red outline-none font-bold uppercase" placeholder="ENTER AREA NAME" />
                                            {errors.address?.custom_area && <p className="text-red-500 text-sm mt-1">{errors.address.custom_area.message}</p>}
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label className="gujarati block text-gray-700 font-bold mb-2 text-lg">Village / City (ગામ) <span className="text-lalabapa-red">*</span></label>
                                        <select 
                                            {...register('address.village_city')} 
                                            className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-lalabapa-gold-primary outline-none font-bold bg-white"
                                        >
                                            <option value="Ahmedabad">AHMEDABAD</option>
                                            <option value="Other">OTHER</option>
                                        </select>
                                    </div>
                                    {watchCity === 'Other' && (
                                        <div className="form-group">
                                            <label className="gujarati block text-gray-700 font-bold mb-2 uppercase">Custom Village / City (ગામનું નામ)</label>
                                            <input 
                                                {...register('address.custom_village_city')} 
                                                onChange={(e) => setValue('address.custom_village_city', e.target.value.toUpperCase())}
                                                className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-lalabapa-gold-primary outline-none font-bold uppercase" 
                                                placeholder="ENTER VILLAGE NAME" 
                                            />
                                            {errors.address?.custom_village_city && <p className="text-red-500 text-sm mt-1">{errors.address.custom_village_city.message}</p>}
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label className="gujarati block text-gray-700 font-bold mb-2 uppercase">Pincode (પીનકોડ) - વૈકલ્પિક</label>
                                        <input {...register('address.pincode')} className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-lalabapa-gold-primary outline-none font-bold" placeholder="6 DIGIT NUMBER" />
                                        {errors.address?.pincode && <p className="text-red-500 text-sm mt-1">{errors.address.pincode.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="gujarati block text-gray-700 font-bold mb-2 text-lg">જિલ્લો <span className="text-lalabapa-red">*</span></label>
                                        <select {...register('address.district')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lalabapa-gold-primary outline-none bg-white font-bold">
                                            <option value="Ahmedabad">Ahmedabad (અમદાવાદ)</option>
                                            <option value="Other">Other (અન્ય)</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Other Info */}
                        {currentStep === 3 && (
                            <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                <div className="title-box border-l-4 border-lalabapa-red pl-4">
                                    <h3 className="gujarati text-2xl font-bold text-lalabapa-red">અન્ય માહિતી</h3>
                                    <p className="text-gray-400 text-sm uppercase tracking-widest leading-none mt-1">Final Details</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label className="gujarati block text-gray-700 font-bold mb-2">જન્મ તારીખ</label>
                                        <input type="date" {...register('other.dob')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lalabapa-gold-primary outline-none" />
                                    </div>
                                    <div className="form-group">
                                        <label className="gujarati block text-gray-700 font-bold mb-2">લિંગ (Gender)</label>
                                        <div className="flex gap-4 p-1 bg-gray-50 rounded-xl border border-gray-100">
                                            {['Male', 'Female', 'Other'].map(gender => (
                                                <button key={gender} type="button" onClick={() => setValue("other.gender", gender)} className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${watch("other.gender") === gender ? 'bg-lalabapa-red text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>
                                                    {gender === 'Male' ? 'પુરુષ' : gender === 'Female' ? 'સ્ત્રી' : 'અન્ય'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group md:col-span-2">
                                        <label className="gujarati block text-gray-700 font-bold mb-2">સમાજમાં તમારી ભૂમિકા / હોદ્દો</label>
                                        <input {...register('other.role')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lalabapa-gold-primary outline-none" placeholder="દા.ત. સમિતિ સભ્ય, સ્વયંસેવક..." />
                                    </div>
                                    <div className="form-group md:col-span-2">
                                        <label className="gujarati block text-gray-700 font-bold mb-2">ખાસ નોંધ</label>
                                        <textarea rows="3" {...register('other.notes')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lalabapa-gold-primary outline-none resize-none" placeholder="અન્ય કોઈ માહિતી જણાવવા માંગતા હોવ તો..."></textarea>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Summary / চકાસણી */}
                        {currentStep === 4 && (
                            <motion.div key="step4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                                <div className="title-box border-l-4 border-lalabapa-red pl-4">
                                    <h3 className="gujarati text-2xl font-bold text-lalabapa-red">માહિતીની ચકાસણી</h3>
                                    <p className="text-gray-400 text-sm uppercase tracking-widest leading-none mt-1">Review Your Details</p>
                                </div>

                                <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                                    {/* Personal & Contact */}
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <h4 className="gujarati text-lg font-bold text-lalabapa-red mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5" /> મુખ્ય માહિતી
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReviewItem label="નામ (Name)" value={getValues('main_member')} />
                                            <ReviewItem label="સભ્યો (Members)" value={getValues('family_members_count')} />
                                            <ReviewItem label="મોબાઇલ (Mobile)" value={getValues('contact.mobile')} />
                                            <ReviewItem label="વોટ્સએપ (WhatsApp)" value={getValues('contact.whatsapp')} />
                                            <ReviewItem label="મોબાઇલ ૨ (Mobile 2)" value={getValues('contact.mobile2') || '-'} />
                                            <ReviewItem label="ઈમેઇલ (Email)" value={getValues('contact.email') || '-'} />
                                            <ReviewItem label="વ્યવસાય (Work)" value={`${getValues('occupation')} : ${getValues('occupation_detail')}`} />
                                            <ReviewItem label="સમયનું યોગદાન" value={getValues('time_contribution') === 'Yes' ? 'હા (Yes)' : getValues('time_contribution') === 'No' ? 'ના (No)' : '-'} />
                                            <ReviewItem label="સમાજને મદદરૂપ" value={getValues('help_society') === 'Yes' ? 'હા (Yes)' : getValues('help_society') === 'No' ? 'ના (No)' : '-'} />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <h4 className="gujarati text-lg font-bold text-lalabapa-red mb-4 flex items-center gap-2">
                                            <Info className="w-5 h-5" /> સરનામું (Address)
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReviewItem label="ઘર નંબર" value={getValues('address.house_no')} />
                                            <ReviewItem label="સોસાયટી" value={getValues('address.society')} />
                                            <ReviewItem label="લેન્ડમાર્ક" value={getValues('address.landmark') || '—'} />
                                            <ReviewItem label="વિસ્તાર (Area)" value={getValues('address.area') === 'Other' ? getValues('address.custom_area') : getValues('address.area')} />
                                            <ReviewItem label="ગામ/શહેર" value={getValues('address.village_city') === 'Other' ? getValues('address.custom_village_city') : getValues('address.village_city')} />
                                            <ReviewItem label="પિનકોડ" value={getValues('address.pincode') || '—'} />
                                            <ReviewItem label="જિલ્લો" value={getValues('address.district')} />
                                        </div>
                                    </div>

                                    {/* Other */}
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <h4 className="gujarati text-lg font-bold text-lalabapa-red mb-4 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" /> અન્ય માહિતી
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReviewItem label="જન્મ તારીખ" value={getValues('other.dob') || '-'} />
                                            <ReviewItem label="લિંગ" value={getValues('other.gender')} />
                                            <ReviewItem label="ભૂમિકા" value={getValues('other.role') || '-'} />
                                        </div>
                                        {getValues('other.notes') && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">નોંધ (Notes)</p>
                                                <p className="gujarati text-sm text-gray-700">{getValues('other.notes')}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Consent Box */}
                                    <div className={`mt-8 p-6 rounded-2xl border-2 transition-all duration-300 ${watch('consent') ? 'bg-green-50 border-green-200 shadow-md shadow-green-500/5' : 'bg-lalabapa-red/5 border-lalabapa-red/10'}`}>
                                        <label className="flex items-start gap-4 cursor-pointer group select-none">
                                            <div className="relative flex items-center mt-1">
                                                <input 
                                                    type="checkbox" 
                                                    {...register('consent')}
                                                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-lalabapa-red transition-all checked:bg-lalabapa-red" 
                                                />
                                                <Check className="absolute w-6 h-6 text-white scale-0 transition-transform peer-checked:scale-75 pointer-events-none" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="gujarati text-sm md:text-base font-bold text-gray-800 leading-relaxed group-hover:text-lalabapa-red transition-colors">
                                                    હું મારી માહિતી આપવા માટે સંમતિ આપું છું અને તે સમાજ ઉપયોગ માટે ઉપયોગ થઈ શકે છે તમારી માહિતી સુરક્ષિત રાખવામાં આવશે અને કોઈ ત્રીજા પક્ષ સાથે શેર નહીં કરવામાં આવે.
                                                </p>
                                                <p className="text-[10px] md:text-xs text-gray-400 font-medium italic leading-relaxed">
                                                    (I consent to provide my information and it can be used for community purposes. Your information will be kept secure and will not be shared with any third party.)
                                                </p>
                                            </div>
                                        </label>
                                        {errors.consent && (
                                            <div className="mt-3 flex items-center gap-2 text-red-500 animate-bounce">
                                                <AlertCircle className="w-4 h-4" />
                                                <p className="gujarati text-xs font-black">{errors.consent.message}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {/* Success Screen */}
                        {isSuccess && (
                            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center space-y-8 py-10 h-full">
                                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center border-4 border-green-100 shadow-xl shadow-green-500/10 mb-2">
                                    <CheckCircle className="w-12 h-12" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="gujarati text-4xl font-black text-gray-900 leading-tight">ડેટા જમા થઈ ગયો છે!</h2>
                                    <p className="text-gray-400 text-sm uppercase font-bold tracking-widest italic">Submission Successful</p>
                                </div>
                                <div className="pt-8 flex flex-col md:flex-row gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => handleDownloadPDF(getValues(), memberID)}
                                        className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                                    >
                                        <Download className="w-5 h-5" /> પીડીએફ ડાઉનલોડ કરો
                                    </button>
                                    <Link to="/" className="inline-flex items-center justify-center px-10 py-4 bg-lalabapa-red text-white rounded-2xl font-bold hover:bg-lalabapa-red-dark transition-all shadow-lg hover:shadow-red-900/20 active:scale-95">
                                        મુખ્ય પૃષ્ઠ પર જાઓ
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Box */}
                    {error && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="gujarati text-sm font-semibold">{error}</p>
                        </div>
                    )}

                    {/* Footer Actions */}
                    {!isSuccess && (
                        <div className="mt-12 flex flex-col-reverse md:flex-row justify-between gap-4 pt-10 border-t border-gray-100">
                            {currentStep > 0 && (
                                <button type="button" onClick={prevStep} className="gujarati w-full md:w-auto px-6 py-4 md:py-3 border border-gray-200 text-gray-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                                    <ChevronLeft className="w-5 h-5" /> પાછળ (Back)
                                </button>
                            )}
                            <div className="md:ml-auto flex w-full md:w-auto gap-4">
                                {currentStep < 4 ? (
                                    <button type="button" onClick={nextStep} className="gujarati w-full md:w-auto px-10 py-4 bg-lalabapa-red text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-lalabapa-red-dark transition-colors shadow-lg group">
                                        આગળ વધો (Next) <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button type="submit" disabled={isSubmitting} className="gujarati w-full md:w-auto px-12 py-4 bg-lalabapa-gold-primary text-lalabapa-red rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-lalabapa-gold-light transition-all shadow-lg shadow-lalabapa-gold-primary/20 disabled:opacity-50">
                                        {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> સબમિટ થઈ રહ્યું છે...</> : "ડેટા જમા કરો (Submit)"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </div>
            {/* Modern Area Selector Modal */}
            <AnimatePresence>
              {isAreaModalOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-gray-900/40 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="gujarati text-2xl font-black text-gray-900 leading-none">વિસ્તાર પસંદ કરો</h3>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2">Select your residential area</p>
                            </div>
                            <button 
                                onClick={() => setIsAreaModalOpen(false)} 
                                className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Search */}
                        <div className="p-6 border-b border-gray-50">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-lalabapa-gold-primary transition-colors" />
                                <input 
                                    type="text"
                                    value={areaSearch}
                                    onChange={(e) => setAreaSearch(e.target.value)}
                                    placeholder="તમારો વિસ્તાર શોધો... (SEARCH AREA)"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:border-lalabapa-gold-primary focus:bg-white transition-all font-bold gujarati uppercase"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Modal List */}
                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-2 custom-scrollbar">
                           {filteredAreas.length > 0 ? (
                               filteredAreas.map((area) => (
                                    <button 
                                        key={area}
                                        type="button"
                                        onClick={() => {
                                            setValue('address.area', area);
                                            setIsAreaModalOpen(false);
                                            setAreaSearch("");
                                        }}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${watch('address.area') === area ? 'border-lalabapa-gold-primary bg-lalabapa-gold-primary/5 shadow-md shadow-lalabapa-gold-primary/10' : 'border-transparent hover:border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${watch('address.area') === area ? 'bg-lalabapa-gold-primary scale-125' : 'bg-gray-100'}`} />
                                            <span className={`gujarati text-sm font-bold ${watch('address.area') === area ? 'text-gray-900' : 'text-gray-600'}`}>{area}</span>
                                        </div>
                                        {watch('address.area') === area && <Check className="w-4 h-4 text-lalabapa-gold-primary" />}
                                    </button>
                               ))
                           ) : (
                               <div className="col-span-full py-12 text-center">
                                   <p className="gujarati text-gray-400 font-bold">તમારો વિસ્તાર મળ્યો નથી? "Other" પસંદ કરો.</p>
                                   <button 
                                        onClick={() => {
                                            setValue('address.area', 'Other');
                                            setIsAreaModalOpen(false);
                                            setAreaSearch("");
                                        }}
                                        className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase"
                                    >
                                        Select "Other" / અન્ય
                                    </button>
                               </div>
                           )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                             <p className="text-[9px] font-black tracking-widest text-gray-300 uppercase leading-none">SOCIETY INFO • STEP 2 OF 3</p>
                        </div>
                    </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hidden PDF Template for Auto-Download */}
            <div className="absolute top-[-9999px] left-[-9999px] z-[-9999]" aria-hidden="true">
                <div id="pdf-template" className="font-inter w-[210mm] min-h-[297mm] p-[15mm] flex flex-col relative" style={{ backgroundColor: '#ffffff' }}>
                    <header className="flex items-center justify-between mb-4 pb-3 border-b-4 border-lalabapa-red relative z-10 gap-4 text-left">
                        <div className="flex items-center gap-6 text-left">
                            <img src="/logo.png" className="w-20 h-20 object-contain" alt="logo" />
                            <div className="text-left">
                                <h1 className="gujarati text-xl font-black text-lalabapa-red leading-tight whitespace-nowrap">શ્રી લાલાબાપા સેવા સમિતિ - વાડજ, અમદાવાદ</h1>
                                <p className="gujarati text-[10px] font-bold text-lalabapa-gold-primary uppercase tracking-widest mt-1">Shri Lalabapa Seva Samiti - Vadaj, Ahmedabad</p>
                                <p className="gujarati text-[9px] font-black text-[#374151] mt-0.5">Trust Reg. No: A/5366/Ahmedabad</p>
                            </div>
                        </div>
                        <div className="text-right bg-red-50 border-2 border-lalabapa-red border-dashed rounded-xl p-3 min-w-[140px]">
                            <p className="text-[10px] font-black uppercase text-[#b96666] tracking-widest mb-0.5">Member ID</p>
                            <p className="text-lg font-black text-lalabapa-red">{memberID || 'GENERATING...'}</p>
                        </div>
                    </header>
                    
                    <div className="space-y-4 flex-1 relative z-10 text-left">
                        <div className="border-2 border-[#f3e6e6] rounded-xl overflow-hidden">
                            <div className="bg-[#fcfafa] border-b-2 border-[#f3e6e6] p-4">
                                <p className="gujarati text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">સભ્યનું નામ (Member Full Name)</p>
                                <p className="gujarati text-2xl font-black text-[#111827]">{getValues('main_member')}</p>
                            </div>

                            <div className="grid grid-cols-4 border-b-2 border-[#f3e6e6]">
                                <div className="p-3 border-r-2 border-[#f3e6e6] col-span-1"><PrintItem label="જન્મ તારીખ (DOB)" value={getValues('other.dob') ? getValues('other.dob').split('-').reverse().join('/') : '—'} /></div>
                                <div className="p-3 border-r-2 border-[#f3e6e6] col-span-1"><PrintItem label="લિંગ (Gender)" value={getValues('other.gender')} /></div>
                                <div className="p-3 border-r-2 border-[#f3e6e6] col-span-1"><PrintItem label="સમાજમાં ભૂમિકા (Society Role)" value={getValues('other.role')} isGujarati /></div>
                                <div className="p-3 col-span-1"><PrintItem label="પરિવાર સંખ્યા (Family)" value={getValues('family_members_count')} /></div>
                            </div>

                            <div className="grid grid-cols-4 border-b-2 border-[#f3e6e6]">
                                <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="મોબાઇલ ૧ (Mobile 1)" value={getValues('contact.mobile')} /></div>
                                <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="મોબાઇલ ૨ (Mobile 2)" value={getValues('contact.mobile2')} /></div>
                                <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="વોટ્સએપ (WhatsApp)" value={getValues('contact.whatsapp')} /></div>
                                <div className="p-3"><PrintItem label="ઈ-મેઈલ (Email)" value={getValues('contact.email')} /></div>
                            </div>

                            <div className="p-4 border-b-2 border-[#f3e6e6] bg-[#fcfafa]">
                                <p className="gujarati text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">સરનામું (Full Address)</p>
                                <p className="gujarati text-sm font-bold text-[#111827] leading-relaxed">
                                    {[
                                        getValues('address.house_no'),
                                        getValues('address.society'),
                                        getValues('address.landmark'),
                                        getValues('address.area') === 'Other' ? getValues('address.custom_area') : getValues('address.area'),
                                        getValues('address.village_city') === 'Other' ? getValues('address.custom_village_city') : getValues('address.village_city'),
                                        getValues('address.pincode')
                                    ].filter(p => p && p.toString().trim() !== '').join(', ') || '—'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2">
                                <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="વ્યવસાય (Occupation)" value={getValues('occupation')} isGujarati /></div>
                                <div className="p-3"><PrintItem label="વ્યવસાય વિગત (Details)" value={getValues('occupation_detail')} isGujarati /></div>
                            </div>
                            <div className="grid grid-cols-2 bg-[#fcfafa] border-t-2 border-[#f3e6e6]">
                                <div className="p-3 border-r-2 border-[#f3e6e6]"><PrintItem label="સમયનું યોગદાન (Contribution)" value={getValues('time_contribution') === 'Yes' ? 'હા (Yes)' : 'ના (No)'} isGujarati /></div>
                                <div className="p-3"><PrintItem label="સમાજ સેવા (Society Help)" value={getValues('help_society') === 'Yes' ? 'હા (Yes)' : 'ના (No)'} isGujarati /></div>
                            </div>
                            <div className="p-4 bg-white border-t-2 border-[#f3e6e6]">
                                <p className="gujarati text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">ખાસ નોંધ (Special Notes)</p>
                                <p className="gujarati text-[13px] font-bold text-[#111827] leading-relaxed whitespace-pre-wrap">{getValues('other.notes') || '—'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t-[3px] border-dashed border-gray-300 flex justify-between items-end relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Registration Date</p>
                            <p className="text-base font-bold text-gray-800 mt-1 bg-gray-100 px-3 py-1.5 rounded-lg inline-block text-left">
                                {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReviewItem = ({ label, value }) => (
    <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
        <span className="gujarati text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
        <span className="gujarati text-base font-bold text-gray-800 text-right">{value}</span>
    </div>
);

const PrintItem = ({ label, value, isGujarati }) => (
    <div className="flex flex-col gap-0.5 w-full text-left">
        <label className="gujarati text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-tight">{label}</label>
        <span className={`${isGujarati ? 'gujarati text-[16px]' : 'text-[14px]'} font-extrabold text-[#111827] leading-tight break-words`}>{value || '—'}</span>
    </div>
);

export default JoinForm;
