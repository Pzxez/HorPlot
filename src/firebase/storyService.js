import { db, auth } from "./config";
import { doc, getDoc, setDoc, serverTimestamp, query, where, collection, getDocs } from "firebase/firestore";

/**
 * Saves or updates story content for a specific project.
 * @param {string} projectId - The ID of the project.
 * @param {string} content - The story content to save.
 */
export const saveStory = async (projectId, content) => {
    if (!projectId) return;
    try {
        const docRef = doc(db, "stories", projectId);
        await setDoc(docRef, {
            content,
            updatedAt: serverTimestamp(),
            projectId,
            userId: auth.currentUser?.uid
        }, { merge: true });
    } catch (e) {
        console.error("Error saving story: ", e);
        throw e;
    }
};

/**
 * Retrieves the story content for a specific project.
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<string|null>} - The story content or null if not found.
 */
export const getStory = async (projectId) => {
    if (!auth.currentUser || !projectId) return null;
    try {
        const docRef = doc(db, "stories", projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().userId === auth.currentUser.uid) {
            return docSnap.data().content;
        }
        return "";
    } catch (e) {
        console.error("Error getting story: ", e);
        throw e;
    }
};
