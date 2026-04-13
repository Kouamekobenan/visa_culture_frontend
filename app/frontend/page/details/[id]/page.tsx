import Header from "@/app/frontend/components/layout/Header";
import EventDetail from "@/app/frontend/components/pages/details/Details";

export default function EventsDetails(){
    return(
         <div className="flex flex-col min-h-screen bg-background font-sans">
             <Header />
             <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center">
            <EventDetail/>
             </main>
           </div>
    )
}