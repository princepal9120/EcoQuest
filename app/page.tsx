

// animate debouncing logo

import { Trees } from "lucide-react";

function AnimatedGlobe(){
  return(
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-green-400 opacity-40 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-green-300 opacity-60 animate-spin"></div>
      <div className="absolute inset-6 rounded-full bg-green-200 opacity-680 animate-bounce"></div>
     <Trees className="absolute inset-0 h-16 w-16 m-auto text-green-600 animate-pulse"/>
    </div>

  )
}
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-20">
        <AnimatedGlobe/>


      </section>
 
    </div>
  );
}
