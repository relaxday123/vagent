"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  LogOut,
  Settings,
  Shield,
  TrendingUp,
  Database,
  Calculator,
  Globe,
} from "lucide-react";

export function Navbar() {
  const { user, loading, isAdmin, signOut } = useAuthContext();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              SecureApp
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/data-crawler"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Data Crawler
                </Link>
                <Link
                  href="/web-scraper"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Web Scraper
                </Link>
                <Link
                  href="/comprehensive-scoring"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Comprehensive Scoring
                </Link>
                {isAdmin() && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/credit-score"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Credit Score
                </Link>
                <Link
                  href="/wallet-scoring"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Wallet Scoring
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.profile?.avatar_url || ""}
                        alt={user.profile?.full_name || ""}
                      />
                      <AvatarFallback>
                        {getInitials(user.profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.profile?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={role === "admin" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/credit-score" className="cursor-pointer">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span>Credit Score</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/data-crawler" className="cursor-pointer">
                      <Database className="mr-2 h-4 w-4" />
                      <span>Data Crawler</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/web-scraper" className="cursor-pointer">
                      <Globe className="mr-2 h-4 w-4" />
                      <span>Web Scraper</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/comprehensive-scoring"
                      className="cursor-pointer"
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      <span>Comprehensive Scoring</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin() && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
