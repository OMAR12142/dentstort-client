import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLayoutStore = create(
  persist(
    (set) => ({
      isSidebarExpanded: true,
      toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
      setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
    }),
    {
      name: 'dentstory-layout-storage', // name of item in the storage (must be unique)
      partialize: (state) => ({ isSidebarExpanded: state.isSidebarExpanded }), // Only persist the expand state
    }
  )
);
