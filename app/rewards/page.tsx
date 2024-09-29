"use client";
import { getAvailableRewards, getRewardTransactions, getUserBalance, getUserByEmail } from "@/utils/db/actions";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Transaction ={
    id: number,
    type:  'earned_report' | 'earned_collect' | 'redeemed',
    amount: number,
    description: string,
    date: string,

}
type Reward={
    id: number,
    name:string,
    cost: number,
    description: string | null,
    collectionInfo: string,
}
function RewardPage() {
    const [user, setUser] = useState<
    id: number;
    email: string;
    name: string;
    > | null(null);
    const [balance, setBalance] = useState(0)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [rewards, setRewards] = useState<Reward[]>([])
    // const [loading, setLoading] = useState(false)
    // useEffect(() => {
    //   const fetchUserDataAndRewards =async () => {
    //     setLoading(true)
    //     try {
    //         const userEmail =localStorage.getItem('userEmail')
    //         if(userEmail){
    //             const fetchUser= await getUserByEmail(userEmail)
    //             if(fetchUser){
    //                 setUser(fetchUser)
    //                 const fetchedTransactions= await getRewardTransactions(fetchUser.id)
    //                 setTransactions(fetchedTransactions as Transaction[])
    //                 const fetchedRewards= await getAvailableRewards(fetchUser.id)
    //                 setRewards(fetchedRewards.filter( (r) => r.cost >0));
    //                 const calculatedBalance: number |null= fetchedTransactions?.reduce((acc, transaction)=>{
    //                     return transaction.type.startsWith('earned')? acc+transaction.amount : acc-transaction.amount;
    //                 },0)
    //                 setBalance(Math.max(calculatedBalance,0));
    //             }else{
    //                 toast.error("User not found. Please login !😥")
    //             }
    //         }else{
    //             toast.error("User not LoggedIn. Please login!")
    //         }

    //     } catch (e) {
    //         console.error("Error while fetching user data and rewards", e);
    //         toast.error("Failed to load rewards data. Please Try again.!")
            
    //     }finally{
    //         setLoading(false)
    
    //       }
        
    //   }
    //   fetchUserDataAndRewards();
      
    // }, []);

    // const handleRedeemReward =async (rewardId:number) => {
    //     if(!user){
    //         toast.error("Please log in to Redeem Rewards.")
    //         return;
    //     }
    //     const reward =rewards.find( r=> r.id ===rewardId)
    //     if(reward && balance>=reward.cost && reward.cost>0){
    //         try {
    //             if(balance< reward.cost){
    //                 toast.error(" Insufficient Balance to Redeem This REward!")
    //                 return;
    //             } 
    //             //update database
    //             await redeemReward(user.id, rewardId);
    //         } catch (e) {
                
    //         }

    //     }
    // }

    if(loading){
        return <div className="flex justify-center items-center h-65">
            <Loader className=" animate-spin h-9 w-9 text-gray-900"/>
            loading.....
        </div>
    }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-center font-semibold text-3xl mb-6 text-gray-800">
        Reward Page
      </h1>
      <div className="flex rounded-xl border-l-4 border-green-600">
        <h1 className="text-2xl font-xs text-gray-800 mb-2">Reward Balance</h1>
        <div className="flex">
            <div className="flex">
                <Coins className="w-8 h-8 text-green-600"/>
            </div>
        </div>
      </div>
    </div>
  );
}

export default RewardPage;
