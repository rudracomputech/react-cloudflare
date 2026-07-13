import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function WhatsAppFloat() {
  const { data } = useQuery({
    queryKey: ["public-settings", "company"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "company_info")
        .maybeSingle();
      return (data?.value as any) ?? null;
    },
  });
  const number = (data?.whatsapp as string | undefined)?.replace(/[^0-9]/g, "") ?? "15555555555";
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact support on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-success px-4 py-3 text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.397.831 3.013 1.27 4.673 1.271 4.933 0 8.94-4.011 8.94-8.946-.002-2.396-.935-4.647-2.627-6.34-1.691-1.692-3.943-2.624-6.337-2.624-4.939 0-8.95 4.01-8.953 8.948 0 1.58.411 3.122 1.189 4.488l.21.366-1.114 4.07 4.17-1.093z" />
      </svg>
      <span className="text-xs font-bold uppercase tracking-widest">Support</span>
    </a>
  );
}