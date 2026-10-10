import { createFileRoute } from '@tanstack/react-router';
export const Route=createFileRoute('/api/chat')({server:{handlers:{POST:async({request})=>{const {handleTutor}=await import('@/lib/ai/tutor.server');return handleTutor(request);}}}});
