import { db } from "./config";
import { doc, setDoc } from "firebase/firestore";

/**
 * Updates the user's terms acceptance status and signature.
 * @param {string} uid - User's unique ID
 * @param {string} signatureBase64 - Base64 encoded signature image
 */
export const updateUserTerms = async (uid, signatureBase64) => {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            hasAcceptedTerms: true,
            signatureData: signatureBase64,
            acceptedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating user terms:", error);
        throw error;
    }
};
