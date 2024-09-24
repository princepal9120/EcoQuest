

// animate debouncing logo

import { Button } from "@/components/ui/button";
import { Coins, HeartHandshake, PenOff, Trees } from "lucide-react";
function FeatureCard({icon:Icon, title, description}:{icon: React.ElementType; title:string; description:string}){
return (
<div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300
ease-in-out flex flex-col items-center text-center
">
<div className="flex bg-green-100 p-4 rounded-full mb-6">
  <Icon className="text-green-600 h-8 w-8"/>


</div>
<h1 className="text-gray-800 text-xl font-semibold mb-4 ">{title}</h1>
<p className="text-gray-600 leading-relaxed">{description}</p>
</div>


)
}

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
      <section className="grid md:grid-cols-3 gap-10 mb-20">
  <FeatureCard icon={Trees} title="Eco-Friendly" description="Easily manage waste disposal, schedule pickups, and track your environmental impact for a cleaner, greener community."/>
  <FeatureCard icon={Coins} title="Rewards" description="Earn points for responsible waste management and redeem them for rewards like discounts and badges."/>
  <FeatureCard icon={HeartHandshake} title="Community Driven" description="Join local clean-up events, participate in challenges, and connect with others committed to sustainability."/>
</section>

 
    </div>
  );
}
