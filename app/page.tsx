

// animate debouncing logo

import { Button } from "@/components/ui/button";
import { Trees } from "lucide-react";

function AnimatedGlobe() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-green-400 opacity-40 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-green-300 opacity-60 animate-spin"></div>
      <div className="absolute inset-6 rounded-full bg-green-200 opacity-80 animate-bounce"></div>
      <Trees className="absolute inset-0 m-auto h-16 w-16 text-green-600 animate-pulse" />
    </div>
  )
}
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center  mb-20">
        <AnimatedGlobe/>

<h1 className="text-gray-800 font-bold mb-6 text-6xl tracking-tight">
  Eco<span className="text-green-600">Quest</span>  <span className="text-green-900">Waste Management </span>
</h1>
<p className="text-gray-600 text-xl mx-auto leading-relaxed ">  Join our community in making waste management more efficient and rewarding!</p>
     <Button className=" bg-green-600 hover:bg-green-700 text-white font-semibold text-lg py-6 px-10 rounded-full">Report Waste</Button> 
      </section>
 
    </div>
  );
}
