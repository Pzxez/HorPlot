import { db, auth } from "./config";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, where } from "firebase/firestore";

/**
 * Adds a new project (novel) to the 'projects' collection.
 * @param {Object} projectData - The project data (title, etc.)
 */
export const addProject = async (projectData) => {
    try {
        const docRef = await addDoc(collection(db, "projects"), {
            ...projectData,
            userId: auth.currentUser?.uid,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding project: ", e);
        throw e;
    }
};

/**
 * Updates an existing project.
 * @param {string} id - The document ID
 * @param {Object} data - The data to update
 */
export const updateProject = async (id, data) => {
    try {
        const docRef = doc(db, "projects", id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Error updating project: ", e);
        throw e;
    }
};

/**
 * Deletes a project.
 * @param {string} id - The document ID
 */
export const deleteProject = async (id) => {
    try {
        const docRef = doc(db, "projects", id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting project: ", e);
        throw e;
    }
};

/**
 * Subscribe to projects collection
 * @param {Function} callback - Callback function for snapshot
 */
export const subscribeToProjects = (callback) => {
    if (!auth.currentUser) return () => { };
    const q = query(
        collection(db, "projects"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, {
        next: (snapshot) => {
            const projects = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(projects);
        },
        error: (error) => {
            console.error("Error subscribing to projects: ", error);
            callback([]); // Provide empty data on error to unblock UI
        }
    }, { includeMetadataChanges: true });
};
