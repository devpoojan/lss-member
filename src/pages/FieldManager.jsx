import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { 
  Settings, Save, Plus, Trash2, GripVertical, AlertCircle, 
  CheckCircle2, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

const FIELD_TYPES = [
  { value: 'text', label: 'લેખિત માહિતી (Plain Text)' },
  { value: 'number', label: 'નંબર (Number)' },
  { value: 'dropdown', label: 'પસંદગી (Dropdown)' },
  { value: 'date', label: 'તારીખ (Date)' },
];

const FieldManager = () => {
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchFields = async () => {
            const docRef = doc(db, "fields", "config");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setFields(docSnap.data().fields.sort((a, b) => a.order - b.order));
            } else {
                // Initial Seed
                const initialFields = [
                    { key: 'name', label: 'પૂરું નામ', type: 'text', required: true, order: 1, active: true, system: true },
                    { key: 'phone', label: 'મોબાઇલ નંબર', type: 'number', required: true, order: 2, active: true, system: true },
                ];
                setFields(initialFields);
            }
            setIsLoading(false);
        };
        fetchFields();
    }, []);

    const saveFields = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, "fields", "config"), { 
              fields: fields.map((f, index) => ({ ...f, order: index + 1 })) 
            });
            setMessage({ type: 'success', text: 'કોન્ફિગરેશન સફળતાપૂર્વક સાચવવામાં આવ્યું છે!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'સેવ કરવામાં ભૂલ થઈ.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const addField = () => {
        const newField = {
            key: `custom_${Date.now()}`,
            label: 'નવું ફિલ્ડ',
            type: 'text',
            required: false,
            active: true,
            order: fields.length + 1,
            system: false
        };
        setFields([...fields, newField]);
    };

    const updateField = (key, updates) => {
        setFields(fields.map(f => f.key === key ? { ...f, ...updates } : f));
    };

    const deleteField = (key) => {
        if (!window.confirm("આ ફિલ્ડ ડિલીટ કરવું છે? ડેટા પર આની અસર થઈ શકે છે.")) return;
        setFields(fields.filter(f => f.key !== key));
    };

    if (isLoading) return <div className="p-12 text-center text-gray-400 gujarati">ફિલ્ડ મેનેજર લોડ થઈ રહ્યું છે...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen max-w-5xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="gujarati text-3xl font-bold text-gray-800">ફિલ્ડ મેનેજર (Fields)</h1>
                    <p className="text-gray-400 text-sm uppercase tracking-widest mt-1">Configure Public Form Structure</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={addField} className="px-6 py-3 bg-white text-lalabapa-red border border-lalabapa-red/20 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all">
                      <Plus className="w-5 h-5" /> Add Field
                  </button>
                  <button onClick={saveFields} disabled={isSaving} className="px-10 py-3 bg-lalabapa-red text-white rounded-xl font-bold flex items-center gap-2 hover:bg-lalabapa-red-dark transition-all shadow-lg disabled:opacity-50">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Configuration
                  </button>
                </div>
            </header>

            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="gujarati font-bold">{message.text}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4">
                {fields.map((field) => (
                  <Reorder.Item 
                    key={field.key} 
                    value={field}
                    dragListener={!field.system}
                    className={`bg-white p-6 rounded-2xl shadow-sm border ${field.system ? 'border-lalabapa-gold-primary/30 bg-lalabapa-gold-primary/[0.02]' : 'border-gray-100'} flex items-center gap-6 group transition-all`}
                  >
                    {!field.system ? (
                      <GripVertical className="w-5 h-5 text-gray-300 cursor-grab active:cursor-grabbing" />
                    ) : (
                      <Settings className="w-5 h-5 text-lalabapa-gold-primary opacity-50" />
                    )}

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Label (Gujarati)</label>
                        <input 
                          value={field.label}
                          onChange={(e) => updateField(field.key, { label: e.target.value })}
                          disabled={field.system}
                          className="w-full bg-gray-50 px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-lalabapa-gold-primary/20 outline-none gujarati font-medium disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.key, { type: e.target.value })}
                          disabled={field.system}
                          className="w-full bg-gray-50 px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-lalabapa-gold-primary/20 outline-none font-medium disabled:opacity-50"
                        >
                          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>

                      <div className="flex items-center gap-8 justify-end pr-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={field.required}
                            disabled={field.system}
                            onChange={(e) => updateField(field.key, { required: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-lalabapa-red focus:ring-lalabapa-red" 
                          />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Required</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={field.active}
                            disabled={field.system}
                            onChange={(e) => updateField(field.key, { active: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-lalabapa-red focus:ring-lalabapa-red" 
                          />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active</span>
                        </label>
                      </div>
                    </div>

                    {!field.system && (
                      <button onClick={() => deleteField(field.key)} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
            
            <footer className="mt-12 p-8 bg-lalabapa-gold-primary/5 rounded-3xl border border-lalabapa-gold-primary/10">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-lalabapa-gold-primary shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-lalabapa-gold-dark uppercase tracking-widest">Important Warning</h4>
                  <p className="text-sm text-gray-500 gujarati">
                    ફિલ્ડ્સ બદલવાથી પબ્લિક ફોર્મમાં તરત જ ફેરફાર થઈ જશે. "સેવ કોન્ફિગરેશન" બટન દબાવ્યા પછી જ ફેરફાર લાગુ થશે. 
                    <br/>નિયમ મુજબ, <b>પૂરું નામ</b> અને <b>મોબાઇલ નંબર</b> સિસ્ટમ ફિલ્ડ્સ છે અને તેને બદલી શકાતા નથી.
                  </p>
                </div>
              </div>
            </footer>
        </div>
    );
};

export default FieldManager;
