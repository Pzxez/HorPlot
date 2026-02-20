import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export const usePremiumStatus = (user) => {
    const [isPremium, setIsPremium] = useState(false);
    const [purchasedFeatures, setPurchasedFeatures] = useState([]);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(null); // Default to null to represent fetching state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsPremium(false);
            setPurchasedFeatures([]);
            setHasAcceptedTerms(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setIsPremium(data.isPremium || false);
                setPurchasedFeatures(data.purchasedFeatures || []);
                setHasAcceptedTerms(data.hasAcceptedTerms || false);
            } else {
                setIsPremium(false);
                setPurchasedFeatures([]);
                setHasAcceptedTerms(false);
            }
            setLoading(false);
        }, (error) => {
            console.error(`Error fetching user data for UID [${user.uid}]:`, error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    return { isPremium, purchasedFeatures, hasAcceptedTerms, setHasAcceptedTerms, loading };
};
