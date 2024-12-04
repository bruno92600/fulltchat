import { create } from "zustand"

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("chat_theme") || "coffee",
    setTheme: (theme) => {
        localStorage.setItem("chat_theme", theme)
        set({ theme })
    }
}))