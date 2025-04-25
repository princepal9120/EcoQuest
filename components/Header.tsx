// @ts-nocheck
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  useAuth,
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import createUser, {
  getUnreadNotifications,
  getUserByEmail,
  getUserBalance,
  markNotificationAsRead,
} from "@/utils/db/actions";
import { Button } from "./ui/button";
import {
  Bell,
  Coins,
  Menu,
  Search,
  Trees,
  LogIn,
  User,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Badge } from "./ui/badge";
import { Notifications } from "@/utils/db/schema";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { SignUpButton } from "@clerk/nextjs";

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [notification, setNotification] = useState<Notification[]>([]);
  const [balance, setBalance] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  // Fetch user data when signed in
  useEffect(() => {
    const syncUserData = async () => {
      if (isSignedIn && user) {
        const email = user.primaryEmailAddress?.emailAddress;
        const name = user.fullName || user.username || "Anonymous User";

        if (email) {
          localStorage.setItem("userEmail", email);
          try {
            await createUser(email, name);
          } catch (error) {
            console.error("Error creating user:", error);
          }
        }
      }
    };

    if (isLoaded && isSignedIn) {
      syncUserData();
    }
  }, [isLoaded, isSignedIn, user]);

  // Notification function
  useEffect(() => {
    const fetchNotifications = async () => {
      if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
        const email = user.primaryEmailAddress.emailAddress;
        console.log("email from clerk", email);
        const userRecord = await getUserByEmail(email);
        if (userRecord) {
          const unreadNotifications = await getUnreadNotifications(
            userRecord.id
          );
          setNotification(unreadNotifications);
        }
      }
    };

    if (isLoaded && isSignedIn) {
      fetchNotifications();
      const notificationInterval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(notificationInterval);
    }
  }, [isLoaded, isSignedIn, user]);

  // Balance show and update function
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
        const email = user.primaryEmailAddress.emailAddress;
        const userRecord = await getUserByEmail(email);
        if (userRecord) {
          const userBalance = await getUserBalance(userRecord.id);
          setBalance(userBalance);
        }
      }
    };

    if (isLoaded && isSignedIn) {
      fetchUserBalance();
      const handleBalanceUpdate = (event: CustomEvent) => {
        setBalance(event.detail);
      };
      window.addEventListener(
        "balanceUpdate",
        handleBalanceUpdate as EventListener
      );
      return () => {
        window.removeEventListener(
          "balanceUpdate",
          handleBalanceUpdate as EventListener
        );
      };
    }
  }, [isLoaded, isSignedIn, user]);

  // Handle notification click
  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    // Refresh the notifications
    if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      const email = user.primaryEmailAddress.emailAddress;
      const userRecord = await getUserByEmail(email);
      if (userRecord) {
        const unreadNotifications = await getUnreadNotifications(userRecord.id);
        setNotification(unreadNotifications);
      }
    }
  };

  if (!isLoaded) {
    return <div>Loading authentication...</div>;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:mr-4"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <Link href="/" className="flex items-center">
            <Trees className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
            <div className="flex flex-col">
              <span className="font-bold text-base md:text-lg text-gray-800 uppercase">
                Eco<span className="text-green-500">Quest</span>
              </span>
            </div>
          </Link>
        </div>
        {!isMobile && (
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="search...."
                className="w-full px-4 py-2 border border-green-300 rounded-full
                focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <Search className="absolute right-3 top-1 text-gray-400" />
            </div>
          </div>
        )}
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2">
              <Search className="h-5 w-5" />
            </Button>
          )}

          <SignedIn>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 relative">
                  <Bell className="h-5 w-5 text-gray-500" />
                  {notification.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                      {notification.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {notification.length > 0 ? (
                  notification.map((notification: any) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{notification.type}</span>
                        <span className="text-sm text-gray-500">
                          {notification.message}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem>No New Notifications</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
              <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500" />
              <span className="font-semibold text-sm md:text-base text-gray-800">
                {balance.toFixed(2)}
              </span>
            </div>

            <UserButton />
          </SignedIn>

          <SignedOut>
            <Button
              onClick={() => router.push("/sign-in")}
              className="bg-green-600 hover:bg-green-800 text-white text-sm mr-2
              md:text-base"
            >
              <SignInButton />
            </Button>

            <Button
              onClick={() => router.push("/sign-up")}
              className="bg-green-600 hover:bg-green-800 text-white text-sm 
              md:text-base"
            >
              <SignUpButton />
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
