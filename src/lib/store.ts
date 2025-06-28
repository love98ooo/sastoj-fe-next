import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Contest } from './api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface AppState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      theme: 'system',
      sidebarCollapsed: false,

      setTheme: theme => set({ theme }),
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'app-storage',
    }
  )
);

// 比赛信息存储
interface ContestState {
  currentContests: Record<string, Contest>; // 以contestId为key的比赛信息
  setContest: (contest: Contest) => void; // 设置比赛信息
  getContest: (contestId: string) => Contest | undefined; // 获取比赛信息
  removeContest: (contestId: string) => void; // 移除比赛信息
}

export const useContestStore = create<ContestState>()(
  persist(
    (set, get) => ({
      currentContests: {},

      setContest: (contest: Contest) => {
        if (!contest.id) return;
        set(state => ({
          currentContests: {
            ...state.currentContests,
            [contest.id]: contest,
          },
        }));
      },

      getContest: (contestId: string) => {
        return get().currentContests[contestId];
      },

      removeContest: (contestId: string) => {
        set(state => {
          const newContests = { ...state.currentContests };
          delete newContests[contestId];
          return { currentContests: newContests };
        });
      },
    }),
    {
      name: 'contest-storage',
      partialize: state => ({
        currentContests: state.currentContests,
      }),
    }
  )
);

// 用户代码存储
interface UserCodeState {
  // 以contestId-problemId-language为key的代码
  codes: Record<string, string>;
  // 获取代码
  getCode: (contestId: string, problemId: string, language: string) => string;
  // 保存代码
  saveCode: (contestId: string, problemId: string, language: string, code: string) => void;
  // 获取用户上次使用的语言
  getLastLanguage: (contestId: string, problemId: string) => string | undefined;
  // 保存用户上次使用的语言
  saveLastLanguage: (contestId: string, problemId: string, language: string) => void;
  // 用户最后使用的语言记录
  lastLanguages: Record<string, string>;
}

export const useUserCodeStore = create<UserCodeState>()(
  persist(
    (set, get) => ({
      codes: {},
      lastLanguages: {},

      getCode: (contestId: string, problemId: string, language: string) => {
        const key = `${contestId}-${problemId}-${language}`;
        return get().codes[key] || '';
      },

      saveCode: (contestId: string, problemId: string, language: string, code: string) => {
        const key = `${contestId}-${problemId}-${language}`;
        set(state => ({
          codes: {
            ...state.codes,
            [key]: code,
          },
        }));
      },

      getLastLanguage: (contestId: string, problemId: string) => {
        const key = `${contestId}-${problemId}`;
        return get().lastLanguages[key];
      },

      saveLastLanguage: (contestId: string, problemId: string, language: string) => {
        const key = `${contestId}-${problemId}`;
        set(state => ({
          lastLanguages: {
            ...state.lastLanguages,
            [key]: language,
          },
        }));
      },
    }),
    {
      name: 'user-code-storage',
    }
  )
);
