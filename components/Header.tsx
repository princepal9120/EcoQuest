import { useState, useEffect } from "react";

import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { usePathname } from "next/navigation";
import createUser, { getUnreadNotifications, getByUserEmail } from "@/utils/db/actions";

const clientId = process.env.WEB3_AUTH_CLIENT_ID!;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Sepolia Testget",
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
            await createUser(user.email,user.name || "Anonymous User");
          }
        }
      } catch (error) {
        console.error("Error Initializing web3auth", error);
      }finally{
        setLoading(false)
      }
    }
    init()
  },[]);

  useEffect(()=>{
        const fetchNotifications =async ()=>{
            if(userInfo && userInfo.email){
                const user=await getByUserEmail(userInfo.email)
                if(user){
                    const unreadNotifications=await  getUnreadNotifications(user.id)
                    setNotification(unreadNotifications);

                }

            }
        }
        fetchNotifications();
        const notificationInterval=setInterval(fetchNotifications,30000)
        return ()=> clearInterval(notificationInterval)
  },[userInfo])

  useEffect(() => {
    const fetchUserBalance= async ()=>{
        if(userInfo && userInfo.email){
            const user=await getByUserEmail(userInfo.email);
            if(user){
                const userBalance= await 
            }
        }
    }
  
 
  }, [third])
  
}

