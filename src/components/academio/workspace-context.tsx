import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BookOpen, ShieldCheck, X, Pause, Play } from "lucide-react";

type Workspace = {
  user: User | null;
  authOpen: boolean;
  setAuthOpen: (v: boolean) => void;
  seconds: number;
  duration: number;
  setDuration: (v: number) => void;
  running: boolean;
  hyper: boolean;
  start: (hyper?: boolean) => Promise<void>;
  pause: () => void;
  reset: () => void;
  subject: string;
  setSubject: (v: string) => void;
  points: number;
  completed: number;
  minutes: number;
  themes: string[];
  theme: string;
  setTheme: (v: string) => void;
  refresh: () => Promise<void>;
};
const Context = createContext<Workspace | null>(null);
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("Workspace unavailable");
  return value;
}
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [duration, setDurationState] = useState(1500);
  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);
  const [hyper, setHyper] = useState(false);
  const [subject, setSubject] = useState("Mathematics");
  const [deadline, setDeadline] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [themes, setThemes] = useState<string[]>([]);
  const [theme, setTheme] = useState("blue");
  const refresh = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setPoints(0);
      setCompleted(0);
      setMinutes(0);
      setThemes([]);
      return;
    }
    const { data: rows, error } = await supabase
      .from("study_sessions")
      .select("hyper,duration,completed_at")
      .not("completed_at", "is", null);
    const { data: redeemed, error: themeError } = await supabase
      .from("theme_redemptions")
      .select("theme");
    if (error || themeError) {
      toast.error("Could not load your study progress");
      return;
    }
    setCompleted(rows?.length ?? 0);
    setMinutes(Math.round((rows ?? []).reduce((sum, r) => sum + r.duration, 0) / 60));
    setPoints((rows ?? []).filter((r) => r.hyper).length - (redeemed?.length ?? 0) * 5);
    setThemes(redeemed?.map((r) => r.theme) ?? []);
  }, []);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
        setUser(session?.user ?? null);
        if (event === "SIGNED_IN") setAuthOpen(false);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    void refresh();
  }, [user, refresh]);
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) {
        setRunning(false);
        setHyper(false);
        if (sessionId) {
          supabase
            .rpc("complete_study_session", { session_id: sessionId })
            .then(async ({ error }) => {
              if (error) toast.error(error.message);
              else {
                toast.success(
                  hyper
                    ? "Session complete. You earned 1 focus point!"
                    : "Study session complete. Well done!",
                );
                await refresh();
              }
            });
        } else toast.success("Study session complete. Well done!");
        setSessionId(null);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [running, deadline, sessionId, hyper, refresh]);
  async function start(isHyper = false) {
    if (isHyper && !user) {
      setAuthOpen(true);
      return;
    }
    if (running) return;
    let id = sessionId;
    if (user && !id) {
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({ subject, duration, hyper: isHyper })
        .select("id")
        .single();
      if (error) {
        toast.error("Could not start your session");
        return;
      }
      id = data.id;
      setSessionId(id);
    }
    setHyper(isHyper);
    setDeadline(Date.now() + seconds * 1000);
    setRunning(true);
  }
  function reset() {
    setRunning(false);
    setHyper(false);
    setSeconds(duration);
    setSessionId(null);
  }
  return (
    <Context.Provider
      value={{
        user,
        authOpen,
        setAuthOpen,
        seconds,
        duration,
        setDuration: (v) => {
          setDurationState(v);
          setSeconds(v);
          setSessionId(null);
          setRunning(false);
        },
        running,
        hyper,
        start,
        pause: () => setRunning(false),
        reset,
        subject,
        setSubject,
        points,
        completed,
        minutes,
        themes,
        theme,
        setTheme,
        refresh,
      }}
    >
      <div data-theme={theme}>{children}</div>
      {hyper && (
        <div className="focus-overlay">
          <div className="brand">
            <BookOpen />
            academio
          </div>
          <div className="subject-icon mint">
            <ShieldCheck size={32} />
          </div>
          <div className="eyebrow">HYPER FOCUS</div>
          <h1>One thing at a time.</h1>
          <p className="subtle">{subject} · Your moment to make progress</p>
          <div className="timer-digits">{formatTime(seconds)}</div>
          <Button onClick={() => (running ? setRunning(false) : start(true))}>
            {running ? <Pause /> : <Play />}
            {running ? "Pause session" : "Resume session"}
          </Button>
          <Button variant="ghost" className="mt-4" onClick={reset}>
            <X />
            End session
          </Button>
          <footer>
            Phone notifications and emergency calls are managed in your phone’s Focus / Do Not
            Disturb settings.
          </footer>
        </div>
      )}
    </Context.Provider>
  );
}
export function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
