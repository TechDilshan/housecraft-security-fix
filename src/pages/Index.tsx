
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { House } from '@/types';
import { getHouses } from '@/services/houseService';
import HouseCard from '@/components/HouseCard';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const [featuredHouses, setFeaturedHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFeaturedHouses = async () => {
      try {
        // Get available houses and limit to 3 for featured section
        const houses = await getHouses({ available: true });
        setFeaturedHouses(houses.slice(0, 3));
      } catch (error) {
        console.error('Error fetching houses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedHouses();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1692&q=80"
            alt="Modern house exterior"
            className="w-full h-full object-cover brightness-[0.7]"
          />
        </div>
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 font-bold">
            Find Your Dream Home
          </h1>
          <p className="text-xl text-white/90 max-w-xl mx-auto mb-8">
            Discover beautiful homes designed with modern aesthetics and traditional principles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/houses">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Browse Homes
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Homes Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif">Featured Homes</h2>
            <Link to="/houses" className="text-accent flex items-center gap-1 group">
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="h-80 bg-card animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredHouses.map((house) => (
                <HouseCard key={house.id} house={house} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-serif text-center mb-12">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Custom House Design</h3>
              <p className="text-muted-foreground">
                Work with our expert engineers to design your dream home exactly as you want it.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Vastu Consultation</h3>
              <p className="text-muted-foreground">
                Ensure your home aligns with traditional vastu principles for harmony and wellbeing.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Architectural Excellence</h3>
              <p className="text-muted-foreground">
                Collaborate with skilled architects to create homes that are both beautiful and functional.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-estate-950 text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-serif mb-4">EstateCraft</h3>
              <p className="text-white/70 text-sm">
                Creating beautiful homes with modern aesthetics and traditional principles.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-white/70 hover:text-white text-sm">Home</Link></li>
                <li><Link to="/houses" className="text-white/70 hover:text-white text-sm">Houses</Link></li>
                <li><Link to="/login" className="text-white/70 hover:text-white text-sm">Login</Link></li>
                <li><Link to="/signup" className="text-white/70 hover:text-white text-sm">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Services</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white text-sm">Engineer Consultation</a></li>
                <li><a href="#" className="text-white/70 hover:text-white text-sm">Vastu Guidelines</a></li>
                <li><a href="#" className="text-white/70 hover:text-white text-sm">Architect Consultation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <address className="not-italic text-white/70 text-sm">
                <p>123 Building Street</p>
                <p>Bangalore, Karnataka</p>
                <p className="mt-2">info@estatecraft.com</p>
                <p>+91 123 456 7890</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
            <p>&copy; {new Date().getFullYear()} EstateCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
