import { useEffect, useState, useRef } from "react";
import { Icons } from "@/assets/icons";

type TestimonialType = {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
};

const testimonials: TestimonialType[] = [
  {
    name: "Marc Diop",
    role: "Designer UI/UX",
    content: "J'ai partagé mes templates de design et j'ai gagné plus de 450,000 FCFA en seulement 3 mois. FaviSend a changé ma façon de monétiser mon travail!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "Aminata Sow",
    role: "Professeur d'Université",
    content: "Mes cours et supports pédagogiques me génèrent un revenu passif intéressant. La plateforme est très simple à utiliser, même pour quelqu'un comme moi.",
    rating: 4.5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "Kofi Ababio",
    role: "Producteur Musical",
    content: "J'ai uploadé mes packs de sons et beats, et je suis surpris par le nombre de téléchargements. FaviSend est le moyen idéal pour les créateurs de monétiser leur travail.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
  }
];

function animateValue(start: number, end: number, duration: number, callback: (value: number) => void) {
  let startTimestamp: number | null = null;
  
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    
    callback(value);
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  
  window.requestAnimationFrame(step);
}

export default function Stats() {
  const [userCount, setUserCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          // Start animations
          animateValue(0, 5420, 2000, setUserCount);
          animateValue(0, 24580, 2000, setDownloadCount);
          animateValue(0, 12300000, 2000, (value) => setEarnings(value));
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold">Ils ont gagné avec FaviSend</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Nos utilisateurs partagent leurs succès. Rejoignez-les et commencez à gagner de l'argent avec vos contenus.
          </p>
        </div>
        
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-purple-50 p-6 rounded-xl text-center">
            <div className="font-heading font-bold text-4xl text-primary mb-2">
              {userCount.toLocaleString()}+
            </div>
            <p className="text-gray-600">Utilisateurs actifs</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-xl text-center">
            <div className="font-heading font-bold text-4xl text-secondary mb-2">
              {downloadCount.toLocaleString()}+
            </div>
            <p className="text-gray-600">Téléchargements</p>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-xl text-center">
            <div className="font-heading font-bold text-4xl text-accent mb-2">
              {(earnings / 1000000).toFixed(1)}M+ FCFA
            </div>
            <p className="text-gray-600">Payés aux créateurs</p>
          </div>
        </div>
        
        {/* User Testimonials */}
        <div className="mt-16">
          <h3 className="text-2xl font-heading font-semibold text-center mb-8">Ce que disent nos utilisateurs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={`Portrait de ${testimonial.name}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(testimonial.rating) ? (
                        <Icons.starFill />
                      ) : testimonial.rating % 1 !== 0 && i === Math.floor(testimonial.rating) ? (
                        <Icons.starHalfFill />
                      ) : (
                        <Icons.star className="text-gray-300" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
