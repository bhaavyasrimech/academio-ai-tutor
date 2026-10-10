import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const loadTutor = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).inputValidator((data:{threadId:string})=>data).handler(async({data,context})=>{
 const {data:thread,error}=await context.supabase.from('tutor_threads').select('*').eq('id',data.threadId).eq('user_id',context.userId).single();
 if(error) throw new Error('Conversation not found');
 const {data:rows,error:messageError}=await context.supabase.from('tutor_messages').select('message').eq('thread_id',data.threadId).order('created_at');
 if(messageError) throw new Error('Could not load your conversation');
 return {thread,messages:rows?.map(row=>row.message)??[]};
});
