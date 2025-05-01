import { create } from "zustand";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export const useUserStore = create((set) => ({
    currentUser: null,
    isLoading: true,

    fetchUserInfo: async (uid) => {
        // If UID is null (i.e., user logged out), reset state
        if (!uid) {
            return set({ currentUser: null, isLoading: false });
        }

        try {
            set({ isLoading: true }); // start loading

            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                set({ currentUser: docSnap.data(), isLoading: false });
            } else {
                set({ currentUser: null, isLoading: false });
            }
        } catch (err) {
            console.error("Error fetching user:", err);
            set({ currentUser: null, isLoading: false });
        }
    },
}));
