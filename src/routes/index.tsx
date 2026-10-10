import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Atom,
  Calculator,
  FlaskConical,
  Dna,
  BookOpen,
  Code2,
  CalendarDays,
  ShieldCheck,
  Trophy,
  Target,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/academio/workspace-context";
import book from "@/assets/study-book.jpg";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "academio · Your study space" },
      {
        name: "description",
        content:
          "A calm academic workspace with a study timer, hyper focus rewards, and your Gemini AI tutor.",
      },
      { property: "og:title", content: "academio · Your study space" },
      {
        property: "og:description",
        content: "Make a little progress every day with focused study and a personal Gemini tutor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
const subjects = [
  {
    name: "Mathematics",
    icon: Calculator,
    color: "blue",
    detail: "Numbers, patterns & possibilities",
    topics: ["Algebra", "Calculus", "Statistics"],
  },
  {
    name: "Physics",
    icon: Atom,
    color: "lavender",
    detail: "Discover how the world works",
    topics: ["Mechanics", "Waves", "Electricity"],
  },
  {
    name: "Chemistry",
    icon: FlaskConical,
    color: "peach",
    detail: "A world of reactions",
    topics: ["Organic chemistry", "Atomic structure", "Chemical bonds"],
  },
  {
    name: "Biology",
    icon: Dna,
    color: "mint",
    detail: "Explore the science of life",
    topics: ["Cell biology", "Genetics", "Ecology"],
  },
  {
    name: "Literature",
    icon: BookOpen,
    color: "rose",
    detail: "Ideas between the lines",
    topics: ["Poetry", "Literary analysis", "Creative writing"],
  },
  {
    name: "Computer Science",
    icon: Code2,
    color: "yellow",
    detail: "Think logically. Create freely.",
    topics: ["Algorithms", "Programming", "Data structures"],
  },
];
function Index() {
  const w = useWorkspace();
  const [selected, setSelected] = useState<(typeof subjects)[number] | null>(null);
  const [focusInfo, setFocusInfo] = useState(false);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return (
    <main className="workspace">
      <div className="page-title">
        <div>
          <h1>Your space to grow.</h1>
          <p className="subtle">Small steps. Clear minds. Big possibilities.</p>
        </div>
        <div className="date">
          <CalendarDays size={16} />
          {today}
        </div>
      </div>
      <section className="welcome">
        <img
          src={book}
          alt="A pastel blue open book and pencil with a small golden star"
          width={1024}
          height={768}
        />
        <div className="welcome-copy">
          <div className="eyebrow">A FRESH PAGE, EVERY DAY</div>
          <h2>
            Make room for
            <br />
            your next big idea.
          </h2>
          <p className="subtle">
            Settle in, pick a subject, and let’s make a little progress together.
          </p>
          <Button size="sm" onClick={() => w.start()}>
            <PlayIcon />
            Start a study session
            <ArrowRight />
          </Button>
        </div>
      </section>
      <div className="content-columns">
        <div>
          <section>
            <div className="section-heading">
              <h2>Your subjects</h2>
              <span className="subtle">A world to explore</span>
            </div>
            <div className="subject-grid">
              {subjects.map((s) => (
                <article className="subject-card" key={s.name}>
                  <div className={`subject-icon ${s.color}`}>
                    <s.icon size={22} />
                  </div>
                  <h3>{s.name}</h3>
                  <p>{s.detail}</p>
                  <ArrowUpRight className="arrow" />
                  <Button
                    variant="ghost"
                    className="subject-open"
                    aria-label={`Open ${s.name}`}
                    onClick={() => {
                      setSelected(s);
                      w.setSubject(s.name);
                    }}
                  />
                </article>
              ))}
            </div>
          </section>
          <section className="focus-panel">
            <div className="section-heading">
              <h2>A little less noise. A lot more focus.</h2>
            </div>
            <div className="focus-summary">
              <div className="subject-icon mint shrink-0 mb-0">
                <ShieldCheck size={23} />
              </div>
              <div>
                <h3>Meet hyper focus.</h3>
                <p className="subtle">
                  Just you and what matters. Give your next study session
                  <br className="hidden sm:block" /> your undivided attention.
                </p>
              </div>
            </div>
            <div className="focus-actions">
              <div className="focus-badge">
                <Trophy size={14} />
                Complete a session. Earn a point. Make it yours.
              </div>
              <Button variant="outline" size="sm" onClick={() => setFocusInfo(true)}>
                Enter hyper focus
                <ArrowRight />
              </Button>
            </div>
          </section>
        </div>
        <aside className="right-column">
          <section className="side-section">
            <div className="flex items-center justify-between">
              <h3>Your study rhythm</h3>
              <Target size={16} className="text-primary" />
            </div>
            <div className="goal-circle">
              <strong>{w.minutes}</strong>
              <span>minutes studied</span>
            </div>
            <div className="goal-stats">
              <div>
                <strong>{w.completed}</strong>
                <span className="subtle">Sessions</span>
              </div>
              <div>
                <strong>{w.points}</strong>
                <span className="subtle">Focus points</span>
              </div>
            </div>
          </section>
          <section className="side-section">
            <div className="reward-title">
              <Trophy size={21} />
              <h3>Good focus pays off.</h3>
            </div>
            <p className="reward-copy">
              Collect points with hyper focus and unlock a study space that feels like you.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                document.querySelector<HTMLButtonElement>(".sidebar nav button:last-child")?.click()
              }
            >
              Explore themes
              <ArrowRight />
            </Button>
          </section>
          <div className="quote">
            <div className="quote-mark">“</div>
            <p>
              It always seems impossible
              <br />
              until it’s done.
            </p>
            <p className="mt-2 text-xs">— Nelson Mandela</p>
          </div>
        </aside>
      </div>
      {selected && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-label={selected.name}>
            <Button
              variant="ghost"
              size="icon"
              className="close"
              aria-label="Close subject"
              onClick={() => setSelected(null)}
            >
              <X />
            </Button>
            <div className={`subject-icon ${selected.color}`}>
              <selected.icon />
            </div>
            <h2>{selected.name}</h2>
            <p className="subtle">{selected.detail}</p>
            <div className="flex flex-wrap gap-2 my-6">
              {selected.topics.map((t) => (
                <span className="bg-muted rounded-md px-3 py-2 text-xs" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <Button
              onClick={() => {
                w.start();
                setSelected(null);
              }}
            >
              <Target />
              Study {selected.name}
            </Button>
          </div>
        </div>
      )}
      {focusInfo && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Start hyper focus">
            <Button
              variant="ghost"
              size="icon"
              className="close"
              aria-label="Close focus settings"
              onClick={() => setFocusInfo(false)}
            >
              <X />
            </Button>
            <div className="subject-icon mint">
              <ShieldCheck />
            </div>
            <h2>Your time. Your attention.</h2>
            <p className="subtle text-sm leading-7">
              {Math.round(w.duration / 60)} minutes of focused {w.subject.toLowerCase()} study.
            </p>
            <p className="subtle text-xs leading-6 my-4">
              To mute phone notifications while allowing emergency calls, enable Focus / Do Not
              Disturb on your phone and set your allowed callers. A website cannot change these
              settings.
            </p>
            <p className="focus-badge mb-5">
              <Check size={16} />1 reward point for a completed session
            </p>
            <Button
              className="w-full"
              onClick={() => {
                w.reset();
                setFocusInfo(false);
                w.start(true);
              }}
            >
              <ShieldCheck />
              Begin hyper focus
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <path d="M3 1.5v9l7-4.5z" />
    </svg>
  );
}
