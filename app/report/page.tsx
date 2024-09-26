"use client";
import React, { useCallback, useEffect, useState } from "react";

import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import toast from "react-hot-toast";
import { createReport, getByUserEmail, getRecentReports } from "@/utils/db/actions";

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const libraries: Libraries = ["places"];

export default function ReportPage() {
  const [user, setUser] = useState("") as any;
  const router = userRouter();
  const [reports, setReports] = useState<
    Array<{
      id: number;
      location: string;
      wasteType: string;
      amount: string;
      createdAt: string;
    }>
  >([]);
  const [newReport, setNewReport] = useState({
    location: "",
    type: "",
    amount: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");

  const [verificationResult, setVerificationResult] = useState<{
    wasteType: string;
    quantity: string;
    confidence: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);
  // fuction to loaded google map api
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
    libraries,
  });
  const onLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);
  const onPlacedChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      console.log(places);
      if (places && places.length > 0) {
        const place = places[0];
        setNewReport((prev) => ({
          ...prev,
          location: place.formatted_address || "",
        }));
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewReport({ ...newReport, [name]: value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log("selectedFile", selectedFile);
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  //verified the waste using google gemini api

  const handleVerify = async () => {
    if (!file) return;

    setVerificationStatus("verifying");

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const base64Data = await readFileAsBase64(file);

      const imageParts = [
        {
          inlineData: {
            data: base64Data.split(",")[1],
            mimeType: file.type,
          },
        },
      ];

      const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
        1. The type of waste (e.g., plastic, paper, glass, metal, organic)
        2. An estimate of the quantity or amount (in kg or liters)
        3. Your confidence level in this assessment (as a percentage)
        
        Respond in JSON format like this:
        {
          "wasteType": "type of waste",
          "quantity": "estimated quantity with unit",
          "confidence": confidence level as a number between 0 and 1
        }`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      console.log("Print the generate data of image", response);

      const text = response.text();

      try {
        const parsedResult = JSON.parse(text);
        if (
          parsedResult.wasteType &&
          parsedResult.quantity &&
          parsedResult.confidence
        ) {
          setVerificationResult(parsedResult);
          setVerificationStatus("success");
          setNewReport({
            ...newReport,
            type: parsedResult.wasteType,
            amount: parsedResult.quantity,
          });
        } else {
          console.error("Invalid verification result:", parsedResult);
          setVerificationStatus("failure");
        }
      } catch (error) {
        console.error("Failed to parse JSON response:", text);
        setVerificationStatus("failure");
      }
    } catch (error) {
      console.error("Error verifying waste:", error);
      setVerificationStatus("failure");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationStatus !== "success" || !user) {
      toast.error("Please verify the waste before submitting or login");
      return;
    }
    setIsSubmitting(true);
    try {
      const report = await createReport(
        user.id,
        newReport.location,
        newReport.type,
        newReport.amount,
        preview || undefined,
        verificationResult? JSON.stringify(verificationResult):undefined,    
 
      );
      const formattedReport={
id: report.id,
location: report.location,
wasteType: report.wasteType,
amount: report.amount,
createdAt: report.createdAt.toISOString().split("T")[0];

      }
      setReports([formattedReport,...reports])
      setNewReport({ location: "", type:" ", amount:" "})
      setFile(null)
setPreview(null)
      setVerificationResult(null)
        setVerificationStatus('idle')
      toast.success(`Report submitted success fully! You've earned points for reward`)
    } catch (error) 
    { 
      console.error("Error while submitting report",error)
      toast.error("Failed to submit report. Please Try again!")
    }finally{
      setIsSubmitting(false)
    }
  };
useEffect(()=>{
 const checkUser=async ()=>{
  const email=localStorage.getItem('userEmail');
  if (email)  {
    let user= await getByUserEmail(email)
    setUser(user);
    const recentReports=(await getRecentReports()) as any;
    const formattedReports= recentReports?.map((report: any)=>({
    ...report,
    createdAt: report.createdAt.toISOString().split('T')[0]
    })
    );
    setReports(formattedReports);
  }else{
    router.push("/")
  }
 };
  checkUser();
},[router])


  return (
    <div className="container mx-auto">
      <section>
        <div className="flex "></div>
      </section>

      <section></section>
    </div>
  );
}
