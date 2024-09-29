import {
  getUserByEmail,
  getWasteCollectionTask,
  saveCollectedWaste,
  saveReward,
  updateTaskStatus,
} from "@/utils/db/actions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
interface CollectionTask {
  id: number;
  location: string;
  wasteType: string;
  amount: string;
  status: "pending" | "in_progress" | " completed" | "verified";
  data: string;
  collectorId: number | null;
}
const ITEM_PER_PAGE = 5;
const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
export default function CollectPage() {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  }>(null);
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWasteType, setHoveredWasteType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [verificationImage, setVerificationImage] = useState<string | null>(
    null
  );
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");
  const [verificationResult, setVerificationResult] = useState<{
    wasteTypeMatch: boolean;
    quantityMatch: boolean;
    confidence: number;
  } | null>(null);
  const [reward, setReward] = useState<number | null>(null);
  useEffect(() => {
    const fetchUserAndTask = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail);
          if (fetchedUser) {
            setUser(fetchedUser);
          } else {
            toast.error("User not found , Please log in again!");
          }
          const fetchedTasks = await getWasteCollectionTask();
          setTasks(fetchedTasks as CollectionTask[]);
        }
      } catch (error) {
        console.error(
          "Failed to load user data and tasks. Please try again!",
          error
        );
        toast.error("Failed to load user data and tasks. Please try again!");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndTask();
  }, []);

  const handleStatusChange = async (
    taskId: number,
    newStatus: CollectionTask["status"]
  ) => {
    if (!user) {
      toast.error("Please login To Collect Waste!");
      return;
    }
    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus, user.id);
      if (updatedTask) {
        setTasks(
          tasks.map((task: any) =>
            task.id === taskId
              ? { ...task, status: newStatus, collectorId: user.id }
              : task
          )
        );

        toast.success("task status updated successfully");
      } else {
        toast.error("Failed to update task status. Please try Again!😒");
      }
    } catch (e) {}
  };
  const readFileAsBase64 = (dataUrl: string): string => {
    return dataUrl.split(",")[1];
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleVerify = async () => {
    if (!selectedTask || !verificationImage || !user) {
      toast.error("Missing required information for verification.");
      return;
    }

    setVerificationStatus("verifying");

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const base64Data = readFileAsBase64(verificationImage);

      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg", // Adjust this if you know the exact type
          },
        },
      ];

      const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
      1. Confirm if the waste type matches: ${selectedTask.wasteType}
      2. Estimate if the quantity matches: ${selectedTask.amount}
      3. Your confidence level in this assessment (as a percentage)
      
      Respond in JSON format like this:
      {
        "wasteTypeMatch": true/false,
        "quantityMatch": true/false,
        "confidence": confidence level as a number between 0 and 1
      }`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();

      try {
        const parsedResult = JSON.parse(text);
        console.log("parsedREsult", parsedResult);

        setVerificationResult({
          wasteTypeMatch: parsedResult.wasteTypeMatch,
          quantityMatch: parsedResult.quantityMatch,
          confidence: parsedResult.confidence,
        });
        setVerificationStatus("success");

        if (
          parsedResult.wasteTypeMatch &&
          parsedResult.quantityMatch &&
          parsedResult.confidence > 0.7
        ) {
          await handleStatusChange(selectedTask.id, "verified");
          const earnedReward = Math.floor(Math.random() * 50) + 10; // Random reward between 10 and 59

          // Save the reward
          await saveReward(user.id, earnedReward);

          // Save the collected waste
          await saveCollectedWaste(selectedTask.id, user.id, parsedResult);

          setReward(earnedReward);
          toast.success(
            `Verification successful! You earned ${earnedReward} tokens!`,
            {
              duration: 5000,
              position: "top-center",
            }
          );
        } else {
          toast.error(
            "Verification failed. The collected waste does not match the reported waste.",
            {
              duration: 5000,
              position: "top-center",
            }
          );
        }
      } catch (error) {
        console.log(error);

        console.error("Failed to parse JSON response:", text);
        setVerificationStatus("failure");
      }
    } catch (error) {
      console.error("Error verifying waste:", error);
      setVerificationStatus("failure");
    }
  };
   const filteredTask =tasks.filter((task )=> 
  task.location.toLowerCase().includes(searchTerm.toLowerCase()));
   const pageCount= Math.ceil(filteredTask.length/ITEM_PER_PAGE);
   const paginatedTasks =filteredTasks.slice(
    (currentPage-1)* ITEM_PER_PAGE,
    currentPage* ITEM_PER_PAGE
   )



  return (
    <div>
      <h1 className="bg-green-500">pagedfdfsdf</h1>
    </div>
  );
}
