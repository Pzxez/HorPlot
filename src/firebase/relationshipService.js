import { db, auth } from "./config";
import { doc, setDoc, getDoc, onSnapshot, query, collection, where } from "firebase/firestore";

/**
 * Saves or updates the relationship map for a specific project.
 * @param {string} projectId 
 * @param {Object} mapData - { nodes, edges }
 */
export const saveRelationshipMap = async (projectId, mapData) => {
    if (!auth.currentUser || !projectId) return;
    try {
        await setDoc(doc(db, "relationship_maps", projectId), {
            ...mapData,
            projectId, // Ensure field exists for querying
            userId: auth.currentUser.uid,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving relationship map:", error);
        throw error;
    }
};

/**
 * Subscribes to the relationship map of a project.
 */
export const subscribeToRelationshipMap = (projectId, callback) => {
    if (!auth.currentUser || !projectId) return () => { };

    // Using a query with userId filter to comply with security rules and handle list-based rules
    const q = query(
        collection(db, "relationship_maps"),
        where("userId", "==", auth.currentUser.uid),
        where("projectId", "==", projectId)
    );

    return onSnapshot(q, {
        next: (snapshot) => {
            if (!snapshot.empty) {
                // Since projectId is unique and used as doc ID, we take the first match
                callback(snapshot.docs[0].data());
            } else {
                callback(null);
            }
        },
        error: (error) => {
            console.error("Error subscribing to relationship map:", error);
            callback(null); // Unblock UI
        }
    });
};
