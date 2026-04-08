import { db, auth } from './src/lib/firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const seed = async () => {
  console.log("Starting seed process...");

  // 1. Initial Fields Configuration
  const fieldsConfig = {
    fields: [
      { key: 'name', label: 'પૂરું નામ', type: 'text', required: true, order: 1, active: true, system: true },
      { key: 'phone', label: 'મોબાઇલ નંબર', type: 'number', required: true, order: 2, active: true, system: true },
      { key: 'area', label: 'વિસ્તાર / એરિયા', type: 'text', required: false, order: 3, active: true, system: false },
      { key: 'dob', label: 'જન્મ તારીખ', type: 'date', required: false, order: 4, active: true, system: false },
      { key: 'family_name', label: 'કુટુંબ / અટક', type: 'text', required: false, order: 5, active: true, system: false },
      { key: 'member_count', label: 'સભ્યોની સંખ્યા', type: 'number', required: false, order: 6, active: true, system: false },
      { key: 'native', label: 'વતન', type: 'text', required: false, order: 7, active: true, system: false },
      { key: 'profession', label: 'વ્યવસાય', type: 'dropdown', required: false, order: 8, active: true, system: false },
      { key: 'business_name', label: 'ધંધાનું નામ', type: 'text', required: false, order: 9, active: true, system: false },
      { key: 'address', label: 'સરનામું', type: 'text', required: false, order: 10, active: true, system: false },
    ]
  };

  try {
    await setDoc(doc(db, "fields", "config"), fieldsConfig);
    console.log("✅ Fields configuration seeded!");

    // 2. Admin User
    // Note: This requires the script to be run in an environment where window is defined or using Firebase Admin SDK
    // Since this is a scratch script for the browser console or a one-time execution, I'll provide it as a guide.
    console.log("👉 Reminder: Create an admin user at /pap/login using the console if needed, or I can provide the login email/password if you prefer to set it manually.");
    
  } catch (error) {
    console.error("❌ Seed failed:", error);
  }
};

seed();
