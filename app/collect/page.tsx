import { getUserByEmail, getWasteCollectionTask } from "@/utils/db/actions";
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
  const [searchItem, setSearchItem] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [verificationImage, setVerificationImage] = useState<string | nll>(
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

  return (
    <div>
      <h1 className="bg-green-500">pagedfdfsdf</h1>
    </div>
  );
}
