import { Navigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

const PrivateRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-warm-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lalabapa-red"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/pap/login" />;
    }

    return children;
};

export default PrivateRoute;
