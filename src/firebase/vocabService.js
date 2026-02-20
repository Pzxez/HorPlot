import { db, auth } from "./config";
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";

/**
 * Adds a new word to the 'vocab_bank' collection.
 * @param {Object} vocabData - The vocab data
 * @param {string} projectId - Selected project ID
 */
export const addVocab = async (vocabData, projectId) => {
    try {
        const docRef = await addDoc(collection(db, "vocabs"), {
            ...vocabData,
            userId: auth.currentUser?.uid,
            projectId,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding word: ", e);
        throw e;
    }
};

/**
 * Subscribe to vocab collection
 * @param {string} projectId - Selected project ID
 * @param {Function} callback - Callback function for snapshot
 */
export const subscribeToVocab = (projectId, callback, category = 'all') => {
    if (!auth.currentUser || !projectId) return () => { };
    let q = query(
        collection(db, "vocabs"),
        where("userId", "==", auth.currentUser.uid),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const vocab = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(vocab);
    });
};

/**
 * Deletes a vocab entry.
 */
export const deleteVocab = async (id) => {
    try {
        const docRef = doc(db, "vocabs", id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting word: ", e);
        throw e;
    }
};
