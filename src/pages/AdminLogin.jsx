import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('માન્ય ઈમેઈલ એડ્રેસ આપો'),
  password: z.string().min(6, 'પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ'),
});

const AdminLogin = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                navigate('/pap');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: 'shreelalabapasevasamiti@gmail.com'
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            navigate('/pap');
        } catch (err) {
            console.error("Login error:", err);
            setError("ખોટો ઇ-મેઇલ અથવા પાસવર્ડ! કૃપા કરીને ફરી પ્રયાસ કરો.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-lalabapa-red-dark p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <img src="/logo.png" className="absolute -top-20 -left-20 w-96 h-96 grayscale invert" alt="bg" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-t-8 border-lalabapa-gold-primary relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative inline-block mb-6"
                    >
                        <div className="absolute inset-0 bg-lalabapa-gold-primary/20 rounded-full blur-2xl -z-10"></div>
                        <img src="/logo.png" alt="Logo" className="w-32 h-32 mx-auto drop-shadow-xl" />
                    </motion.div>
                    <h1 className="gujarati text-3xl font-black text-lalabapa-red leading-snug">એડમિન લૉગિન<br/><span className="text-xl font-bold opacity-60">Admin Login</span></h1>
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-lalabapa-gold-primary to-transparent mx-auto mt-4 opacity-30"></div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Hidden Email Field (Fixed for Admin) */}
                    <input type="hidden" {...register('email')} />

                    <div className="space-y-4">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-16 h-16 bg-lalabapa-red/5 rounded-2xl flex items-center justify-center mb-4 border border-lalabapa-red/10">
                                <Lock className="w-8 h-8 text-lalabapa-red" />
                            </div>
                            <h2 className="gujarati text-lg font-bold text-gray-800">પાસવર્ડ દાખલ કરો (Enter Password)</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Authorized Access Only</p>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="relative group">
                                <input 
                                    type="password"
                                    {...register('password')}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-lalabapa-red focus:ring-4 focus:ring-lalabapa-red/10 transition-all outline-none font-bold text-lg"
                                    placeholder="••••••••"
                                    autoFocus
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.password.message}</p>}
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="gujarati text-sm font-semibold leading-snug">{error}</p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 bg-lalabapa-red text-white hover:bg-lalabapa-red-dark transition-all rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-red-900/20 disabled:opacity-50"
                    >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> લૉગિન થઈ રહ્યું છે...</> : "લૉગિન કરો"}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-lalabapa-red text-sm transition-colors decoration-dotted underline">
                        મુખ્ય પૃષ્ઠ પર પાછા જાઓ
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
