
import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navbar = () => {
  const { user, logout } = useAuth();
  
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-serif font-semibold text-estate-950">Estate<span className="text-terracotta-500">Craft</span></span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 ml-10">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/houses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Houses
            </Link>
            {user && (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Admin
                  </Link>
                )}
                {user.role === 'engineer' && (
                  <Link to="/engineer-dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                )}
                {user.role === 'architect' && (
                  <Link to="/architect-dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                )}
                {user.role === 'vastu' && (
                  <Link to="/vastu-dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                )}
                {user.role === 'user' && (
                  <Link to="/my-requests" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    My Requests
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-sm font-medium hover:text-accent transition-colors py-2">
                  Home
                </Link>
                <Link to="/houses" className="text-sm font-medium hover:text-accent transition-colors py-2">
                  Houses
                </Link>
                {user && (
                  <>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="text-sm font-medium hover:text-accent transition-colors py-2">
                        Admin Dashboard
                      </Link>
                    )}
                    {user.role === 'engineer' && (
                      <Link to="/engineer-dashboard" className="text-sm font-medium hover:text-accent transition-colors py-2">
                        Engineer Dashboard
                      </Link>
                    )}
                    {user.role === 'architect' && (
                      <Link to="/architect-dashboard" className="text-sm font-medium hover:text-accent transition-colors py-2">
                        Architect Dashboard
                      </Link>
                    )}
                    {user.role === 'vastu' && (
                      <Link to="/vastu-dashboard" className="text-sm font-medium hover:text-accent transition-colors py-2">
                        Vastu Dashboard
                      </Link>
                    )}
                    {user.role === 'user' && (
                      <Link to="/my-requests" className="text-sm font-medium hover:text-accent transition-colors py-2">
                        My Requests
                      </Link>
                    )}
                    <Button variant="outline" className="mt-4" onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
                {!user && (
                  <>
                    <Link to="/login" className="text-sm font-medium hover:text-accent transition-colors py-2">
                      Login
                    </Link>
                    <Link to="/signup" className="text-sm font-medium hover:text-accent transition-colors py-2">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* User Menu (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/profile" className="flex w-full">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
