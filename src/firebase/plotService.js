import { db, auth } from "./config";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, where } from "firebase/firestore";

/**
 * Adds a new plot beat to the 'plots' collection.
 * @param {Object} plotData - The plot data
 */
export const addPlot = async (plotData, projectId) => {
    try {
        const docRef = await addDoc(collection(db, "plots"), {
            ...plotData,
            userId: auth.currentUser?.uid,
            projectId,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding plot: ", e);
        throw e;
    }
};

/**
 * Subscribe to plots collection
 * @param {Function} callback - Callback function for snapshot
 */
export const subscribeToPlots = (projectId, callback) => {
    if (!auth.currentUser || !projectId) return () => { };
    const q = query(
        collection(db, "plots"),
        where("userId", "==", auth.currentUser.uid),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const plots = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(plots);
    });
};

/**
 * Updates an existing plot beat.
 * @param {string} id - The document ID
 * @param {Object} data - The data to update
 */
export const updatePlot = async (id, data) => {
    try {
        const docRef = doc(db, "plots", id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Error updating plot: ", e);
        throw e;
    }
};

/**
 * Deletes a plot beat.
 * @param {string} id - The document ID
 */
export const deletePlot = async (id) => {
    try {
        const docRef = doc(db, "plots", id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting plot: ", e);
        throw e;
    }
};
