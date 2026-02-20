import { db, auth } from "./config";
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";

/**
 * Adds a new character to the 'characters' collection.
 * @param {Object} characterData - The character data
 */
export const addCharacter = async (characterData, projectId) => {
    try {
        const docRef = await addDoc(collection(db, "characters"), {
            ...characterData,
            userId: auth.currentUser?.uid,
            projectId,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding character: ", e);
        throw e;
    }
};

/**
 * Subscribe to characters collection
 * @param {Function} callback - Callback function for snapshot
 */
export const subscribeToCharacters = (projectId, callback) => {
    if (!auth.currentUser || !projectId) return () => { };
    const q = query(
        collection(db, "characters"),
        where("userId", "==", auth.currentUser.uid),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, {
        next: (snapshot) => {
            const characters = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(characters);
        },
        error: (error) => {
            console.error("Error subscribing to characters:", error);
            callback([]); // Unblock with empty list
        }
    });
};

/**
 * Updates a character entry.
 */
export const updateCharacter = async (id, updatedData) => {
    try {
        const docRef = doc(db, "characters", id);
        await updateDoc(docRef, updatedData);
    } catch (e) {
        console.error("Error updating character: ", e);
        throw e;
    }
};

/**
 * Deletes a character entry.
 */
export const deleteCharacter = async (id) => {
    try {
        const docRef = doc(db, "characters", id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting character: ", e);
        throw e;
    }
};
