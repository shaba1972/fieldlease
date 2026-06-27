import { MessageSquare } from "lucide-react";

export default function WhatsAppButton() {
  const whatsappUrl = "https://wa.me/2348152228251?text=Hi%2C%20I%27m%20looking%20for%20temporary%20land%20to%20lease%20and%20need%20advisory%20sourcing%20assistance.";

  return (
    <div className="fixed bottom-6 right-6 z-40" id="whatsapp-sticky-button">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 group relative"
        aria-label="Chat on WhatsApp"
      >
        <MessageSquare className="w-7 h-7" />
        
        {/* Floating Tooltip Notification */}
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Need Land Sourcing Help? Chat Now!
        </span>

        {/* Dynamic Pulse indicator */}
        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
          1
        </span>
      </a>
    </div>
  );
}
