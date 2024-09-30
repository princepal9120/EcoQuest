"use client";
import { Button } from "@/components/ui/button";
import {
  createTransaction,
  getAvailableRewards,
  getRewardTransactions,
  getUserBalance,
  getUserByEmail,
  redeemReward,
} from "@/utils/db/actions";
import {
  AlertOctagon,
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Gift,
  Loader,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Transaction = {
  id: number;
  type: "earned_report" | "earned_collect" | "redeemed";
  amount: number;
  description: string;
  date: string;
};
type Reward = {
  id: number;
  name: string;
  cost: number;
  description: string | null;
  collectionInfo: string;
};
function RewardPage() {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  } | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchUserDataAndRewards = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          const fetchUser = await getUserByEmail(userEmail);
          if (fetchUser) {
            setUser(fetchUser);
            const fetchedTransactions = await getRewardTransactions(
              fetchUser.id
            );
            setTransactions(fetchedTransactions as Transaction[]);
            const fetchedRewards = await getAvailableRewards(fetchUser.id);
            setRewards(fetchedRewards.filter((r) => r.cost > 0));
            const calculatedBalance: number | null =
              fetchedTransactions?.reduce((acc, transaction) => {
                return transaction.type.startsWith("earned")
                  ? acc + transaction.amount
                  : acc - transaction.amount;
              }, 0);
            setBalance(Math.max(calculatedBalance, 0));
          } else {
            toast.error("User not found. Please login !😥");
          }
        } else {
          toast.error("User not LoggedIn. Please login!");
        }
      } catch (e) {
        console.error("Error while fetching user data and rewards", e);
        toast.error("Failed to load rewards data. Please Try again.!");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDataAndRewards();
  }, []);

  //   const handleRedeemReward =async (rewardId:number) => {
  //       if(!user){
  //           toast.error("Please log in to Redeem Rewards.")
  //           return;
  //       }
  //       const reward =rewards.find( r=> r.id ===rewardId)
  //       if(reward && balance>=reward.cost && reward.cost>0){
  //           try {
  //               if(balance< reward.cost){
  //                   toast.error(" Insufficient Balance to Redeem This REward!")
  //                   return;
  //               }
  //               //update database
  //               await redeemReward(user.id, rewardId);
  //           } catch (e) {

  //           }

  //       }
  //   }

  //   const handleRedeemAllPoints= async () => {
  //     if(!user){
  //         toast.error("Please log in to redeem Points");
  //         return;
  //     }
  //     if(balance>0){
  //         try {
  //             // update database
  //             await redeemReward(user.id,0)
  //        // create a new Transaction record
  //             await createTransaction(user.id, 'redeemed', balance, "Redeemed All Points");
  // //
  //             await refreshUserData();
  //         } catch (e) {

  //         }
  //     }
  //   }
  if (loading) {
    return (
      <div className="flex justify-center items-center h-65">
        <Loader className=" animate-spin h-9 w-9 text-gray-900" />
        loading.....
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-center font-semibold text-3xl mb-6 text-gray-800">
        Rewards
      </h1>
      <div className="flex flex-col justify-between bg-white p-6 shadow-lg rounded-xl border-l-4 border-green-600 h-full mb-8">
        <h1 className="text-2xl font-xs text-gray-800 mb-2">Reward Balance</h1>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <Coins className="w-8 h-8 text-green-600 mr-2" />
            <div>
              <span className="text-3xl font-semibold text-green-600">
                {balance}
              </span>
              <p className="text-sm text-gray-500">Available Points</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2  gap-8">
        <div>
          <h2 className=" font-semibold text-2xl mb-6 text-gray-800">
            Recent Transactions
          </h2>
          <div className=" bg-white shadow-lg rounded-xl overflow-hidden ">
            {transactions.length > 0 ? (
              transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4
            border-b border-gray-300 last:border-0"
                >
                  <div className="flex items-center">
                    {transaction.type === "earned_report" ? (
                      <ArrowUpRight className="h-6 w-6 text-green-500 mr-3 " />
                    ) : (
                      <ArrowDownRight className="h-6 w-6 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {" "}
                        {transaction.date}{" "}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.type.startsWith("earned")
                        ? "text-green-500"
                        : "text-red-500"
                    } `}
                  >
                    {transaction.type.startsWith("earned") ? "+" : "-"}
                    {transaction.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className=" font-semibold text-2xl mb-6 text-gray-800">
            Available Rewards
          </h2>
          <div className="space-y-4">
            {rewards.length > 0 ? (
              rewards.map((reward) => (
                <div key={reward.id} className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className=" text-lg font-semibold text-gray-700">{reward.name}:</h3>
                    <span className="font-semibold text-green-500 ml-1">{reward.cost}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{reward.description}</p>
                  <p className="text-sm text-gray-500 mb-4">{reward.collectionInfo}</p>
                  {reward.id === 0 ? (
                    <div className="space-y-2">
                      <Button
                        //   onClick={handleRedeemAllPoints}
                        className=" w-full bg-green-500 hover:bg-green-600 text-white"
                        disabled={balance === 0}
                      >
                        <Gift className="w-4 h-4 mr-2"/>
                        Redeem All Points
                      </Button>
                    </div>
                  ) : (
                    <Button
                    //   onClick={handleRedeemReward(reward.id)}
                      className=" w-full bg-green-500 hover:bg-green-600 text-white"
                      disabled={balance < reward.cost}
                    >
                      <Gift className="w-4 h-4 mr-2"/>
                      Redeem Reward
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 bg-blue-300 border-l-4 border-blue-950 rounded-md">
                <div className="flex">
                  <AlertOctagon className="h-6 w-6 text-blue-500 mr-3" />
                  <p className="text-blue-700">
                    No rewards available t the moment
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RewardPage;
