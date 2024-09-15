import { useState, useEffect } from "react";

import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { usePathname } from "next/navigation";
import createUser, {
  getUnreadNotifications,
  getByUserEmail,
  getUserBalance,
  markNotificationAsRead,
} from "@/utils/db/actions";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

//reward section using web3 blockchain technology
//give user reward using crypto coin
const clientId = process.env.WEB3_AUTH_CLIENT_ID!;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Sepolia Testnet",
  blockExploreUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://assets.web3auth.io/evm-chains/sepolia.png",
};
const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: chainConfig,
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
  privateKeyProvider,
});
interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const pathname = usePathname();
  const [notification, setNotification] = useState<Notification[]>([]);
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    const init = async () => {
      try {
        setProvider(web3auth.provider);
        if (web3auth.connected) {
          setLoggedIn(true);
          const user = await web3auth.getUserInfo();
          setUserInfo(user);
          if (user.email) {
            localStorage.setItem("userEmail", user.email);
            await createUser(user.email, user.name || "Anonymous User");
          }
        }
      } catch (error) {
        console.error("Error Initializing web3auth", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);
  // reward notification  function
  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getByUserEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotification(unreadNotifications);
        }
      }
    };
    fetchNotifications();
    const notificationInterval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(notificationInterval);
  }, [userInfo]);
  // balance show and update function
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo && userInfo.email) {
        const user = await getByUserEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      }
    };

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
  }, [userInfo]);

  // login fucntion
  const login = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized");
      return;
    }
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        try {
          await createUser(user.email, user.name || "Anonymous user");
        } catch (error) {
          console.error("Error while creating user", error);
        }
      }
    } catch (error) {
      console.error("Error while logging in ", error);
    }
  };
  const logout = async () => {
    if (!web3auth) {
      console.log("Web3Auth is not initialized");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem("userEmail");
    } catch (error) {
      console.error("Error logging out", error);
    }
  };
  // dropdown userInfo function
  const getUserInfo = async () => {
    if (web3auth.connected) {
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        try {
          await createUser(user.email, user.name || "Anonymous User");
        } catch (error) {
          console.error("Error while creating user ||", error);
        }
      }
    }
  };
  //handle notification function
  const handleNotifictionClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
  };
  //   if (loading) {
  //     return <div>Loading web3 auth.....</div>;
  //   }
  //   return (
  //     <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
  //       <div
  //         className="flex items-center justify-center px-4
  //  py-2"
  //       >
  //         <div className="flex items-center">
  //           <Button
  //             variant="ghost"
  //             className="mr-2 md:mr-4"
  //             onClick={onMenuClick}
  //           >
  //             <Menu className=" h-6 w-6" />
  //           </Button>
  //         </div>
  //       </div>
  //     </header>
  //   );
}
