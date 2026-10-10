<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep study state in a shared workspace provider so navigating tutor conversations does not reset a running timer.
- Persist tutor threads and UI messages with owner-scoped Cloud policies and real conversation URLs to prevent cross-thread leakage.
- Run Gemini and tool execution only in server modules through the AI SDK gateway so credentials stay private.
- Award session points and redeem themes in authenticated transactional database functions so rewards cannot be granted by client state.
