// 'use client'
// import { getAvailableRewards, getUserByEmail } from '@/utils/db/actions'
// import { Award, AwardIcon, Crown, Loader, Trophy, User } from 'lucide-react'
// import React, { useEffect, useState } from 'react'
// import toast from 'react-hot-toast'

// type Reward ={
//     id: number
//     userId: number
//     points: number
//     level: number
//     createdAt: string
//     username: string | null
// }
// export default function LeaderBoardPage() {
//     const [rewards, setRewards] = useState<Reward[]>([])
//     const [loading, setLoading] = useState(false)
//     const [user, setUser] = useState<{id: number, email: string, name: string} | null>(null)
//     useEffect (()=>{
//         const fetchedRewardsAndUser =async () => {
//             setLoading(true)
//             try {
//                 const fetchedRewards =await getAvailableRewards()
//                 setRewards(fetchedRewards)
//                 const userEmail = localStorage.getItem('userEmail')
//                 if(userEmail){
//                     const fetchedUser = await getUserByEmail();
//                     if(fetchedUser){
//                         setUser(fetchedUser)

//                     }else{
//                         toast.error("User not found. Please login  again!")
//                     }
//                 }else{
//                     toast.error('User not logged in. Please log in.')
//                 }
//             } catch (error) {
//                 console.error('Error fetching rewards and user:', error)
//                 toast.error('Failed to load leaderboard. Please try again.')
//               } finally {
//                 setLoading(false)
//               }
//         }
//         fetchedRewardsAndUser();
//     },[])
//   return (
//     <div>
        
//         <div className="max-w-3xl mx-auto">
//             <h1 className='text-gray-800 text-center font-semibold text-3xl mb-6'>LeaderBoard</h1>
//             {
//                 loading?(
//                    <div className="flex justify-center items-center h-64">
//                        <Loader className="w-9 h-9 text-gray-600 animate-spin " />
//                    </div>
//                 ):(
//            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//             <div className='bg-gradient-to-r from-green-300 to-green-600 p-6'>
//                 <div className="flex justify-between items-center ">
//                     <Trophy className='h-8 w-10 text-white mr-2'/>
//                     <span className='text-gray-600 text-2xl font-bold'>Top Performers</span>
//                     <Award className='h-8 w-10 text-white mr-2' />
//                 </div>
//             </div>
//             <div className="overflow-x-auto">
//                 <table className="w-full">
//                     <thead className='bg-gray-50'>
//                         <tr>
//                             <th className='px-6 py-3 text-left text-xs font-semibold  text-gray-500 uppercase tracking-wider'>Rank</th>
//                             <th className='px-6 py-3 text-left text-xs font-semibold  text-gray-500 uppercase tracking-wider'>Rank</th>
//                             <th className='px-6 py-3 text-left text-xs font-semibold  text-gray-500 uppercase tracking-wider'>Rank</th>
//                             <th className='px-6 py-3 text-left text-xs font-semibold  text-gray-500 uppercase tracking-wider'>Rank</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {
//                             rewards.map((reward, index)=>(
//                                 <tr key={reward.id} >
//                                     <td>
//                                         <div>
//                                             {
//                                                 index<3 ?(
//                                                     <Crown className={`h-6 w-6 ${index===0?'text-yellow-400': index==1?'text-gray-400 ': 'text-yellow-600'}`}
//                                                     />

//                                                 ):(
//                                                     <span className='text-sm font-medium text-gray-600'>{index+1}</span>
//                                                 )
//                                             }
//                                         </div>
//                                     </td>
//                                     <td>
//                                         <div className="flex">
//                                             <div className="h-10">
//                                                 <User/>

//                                             </div>
//                                             <div>
//                                                 <div className="text-sm font-medium text-gray-900">{reward.username}</div>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td>
//                                         <div>
//                                             <AwardIcon className="h-5 w-5 text-indigo-500 mr-2"/>
//                                             <div className="text-sm font-semibold text-gray-900">{reward?.points?.toLocaleString()}</div>
//                                         </div>
//                                     </td>
//                                     <td>
//                                         <span>Level {reward.level}</span>
//                                     </td>
//                                 </tr>
//                             ))
//                         }
//                     </tbody>
//                 </table>
//             </div>
//            </div>
//                 )
//             }
//         </div>
//     </div>
//   )
// }

