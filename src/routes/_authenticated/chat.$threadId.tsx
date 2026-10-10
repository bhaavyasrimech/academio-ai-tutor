import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { Plus, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TutorChat } from "@/components/academio/tutor-chat";
import { supabase } from "@/integrations/supabase/client";
import { loadTutor } from "@/lib/tutor.functions";
import { toast } from "sonner";
const tutorOptions = (threadId: string) =>
  queryOptions({
    queryKey: ["tutor", threadId],
    queryFn: () => loadTutor({ data: { threadId } }),
    staleTime: 0,
  });
const threadsOptions = queryOptions({
  queryKey: ["tutor-threads"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("tutor_threads")
      .select("id,title")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Your ai tutor · academio" },
      {
        name: "description",
        content: "Learn with your personal Gemini academic tutor and saved subject conversations.",
      },
      { property: "og:title", content: "Your ai tutor · academio" },
      {
        property: "og:description",
        content: "Work through questions with your academic Gemini tutor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(tutorOptions(params.threadId)),
      context.queryClient.ensureQueryData(threadsOptions),
    ]);
  },
  component: TutorPage,
});
function TutorPage() {
  const { threadId } = Route.useParams();
  const { data } = useSuspenseQuery(tutorOptions(threadId));
  const { data: threads } = useSuspenseQuery(threadsOptions);
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function newThread() {
    const { data, error } = await supabase.from("tutor_threads").insert({}).select("id").single();
    if (error) {
      toast.error("Could not create a conversation");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["tutor-threads"] });
    navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
  }
  return (
    <main className="chat-layout">
      <aside className="thread-sidebar">
        <Button variant="outline" onClick={newThread}>
          <Plus />
          New conversation
        </Button>
        <div className="nav-label !mt-6 !mb-2">YOUR CONVERSATIONS</div>
        {threads.map((t) => (
          <div className="thread-item" key={t.id}>
            <MessageCircle size={14} className="shrink-0 text-muted-foreground" />
            <Link
              to="/chat/$threadId"
              params={{ threadId: t.id }}
              className={t.id === threadId ? "text-primary" : "text-muted-foreground"}
            >
              {t.title}
            </Link>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Delete ${t.title}`}
              title="Delete conversation"
              onClick={async () => {
                if (!window.confirm("Delete this conversation?")) return;
                const { error } = await supabase.from("tutor_threads").delete().eq("id", t.id);
                if (error) {
                  toast.error("Could not delete conversation");
                  return;
                }
                await qc.invalidateQueries({ queryKey: ["tutor-threads"] });
                if (t.id === threadId) {
                  const other = threads.find((x) => x.id !== t.id);
                  if (other) navigate({ to: "/chat/$threadId", params: { threadId: other.id } });
                  else navigate({ to: "/" });
                }
              }}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        ))}
      </aside>
      <TutorChat
        key={threadId}
        threadId={threadId}
        initialMessages={data.messages as unknown as UIMessage[]}
      />
    </main>
  );
}
