"use client";
import React, { useCallback, useEffect, useState } from "react";

import {
  Libraries,
  StandaloneSearchBox,
  useJsApiLoader,
} from "@react-google-maps/api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import toast from "react-hot-toast";
import createUser, {
  createReport,
  getUserByEmail,
  getRecentReports,
} from "@/utils/db/actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader, MapPin, Upload } from "lucide-react";
import Image from "next/image";

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const libraries: Libraries = ["places"];

export default function ReportPage() {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
    createdAt: Date;
  } | null>(null);
  const router = useRouter();
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
    confidence: number;
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
  const onPlacesChanged = () => {
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
      console.log("selectedFile fromhandleFileChange", selectedFile);
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

      // Prompt explicitly asks for raw JSON only
      const prompt = `You are an expert in waste management and recycling.
  Analyze the image and respond with ONLY valid JSON (no explanation, no markdown fences), exactly in this format:
  
  {
    "wasteType": "type of waste (e.g., plastic, paper, glass, metal, organic)",
    "quantity": "estimated quantity with unit (e.g., 2.5 kg)",
    "confidence": confidence level between 0 and 1
  }`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = result.response;
      const text = await response.text();

      // Strip any ```json or ``` fences just in case
      const clean = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        const parsedResult = JSON.parse(clean);
        console.log("parsedResult", parsedResult);

        const { wasteType, quantity, confidence } = parsedResult;
        if (wasteType && quantity && typeof confidence === "number") {
          setVerificationResult(parsedResult);
          setVerificationStatus("success");
          setNewReport({
            ...newReport,
            type: wasteType,
            amount: quantity,
          });
        } else {
          console.error("Invalid verification result shape:", parsedResult);
          setVerificationStatus("failure");
        }
      } catch (err) {
        console.error("Failed to parse JSON response:", clean, err);
        setVerificationStatus("failure");
      }
    } catch (error) {
      console.error("Error verifying waste:", error);
      setVerificationStatus("failure");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.log("user from report", user)
      toast.error("Please log in before submitting");
      return;
    }
    if (verificationStatus !== "success") {
      toast.error("Please verify the waste before submitting");
      return;
    }
    setIsSubmitting(true);
    try {
      const report = (await createReport(
        user.id,
        newReport.location,
        newReport.type,
        newReport.amount,
        preview || undefined,
        verificationResult ? JSON.stringify(verificationResult) : undefined
      )) as any;
      const formattedReport = {
        id: report.id,
        location: report.location,
        wasteType: report.wasteType,
        amount: report.amount,
        createdAt: report.createdAt.toISOString().split("T")[0],
      };
      setReports([formattedReport, ...reports]);
      setNewReport({ location: "", type: " ", amount: " " });
      setFile(null);
      setPreview(null);
      setVerificationStatus("idle");
      setVerificationResult(null);

      toast.success(
        `Report submitted success fully! You've earned points for reward`
      );
    } catch (error) {
      console.error("Error while submitting report", error);
      toast.error("Failed to submit report. Please Try again!");
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    const checkUser = async () => {
      const email = localStorage.getItem("userEmail");
      if (email) {
        let user = await getUserByEmail(email);
        console.log("user from checkUser", user);
        if (!user) {
          user = (await createUser(email, "Anonymous User")) as {
            id: number;
            name: string;
            email: string;
            createdAt: Date;
          };
        }
        setUser(user);

        const recentReports = (await getRecentReports()) as any;
        const formattedReports = (
          Array.isArray(recentReports) ? recentReports : []
        ).map((report) => ({
          ...report,
          createdAt: report.createdAt.toISOString().split("T")[0],
        }));

        setReports(formattedReports);
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="p-8 mx-auto max-w-4xl">
      <h1 className=" mb-6 font-semibold text-center text-3xl text-gray-800">
        Report Waste
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-9 rounded-2xl shadow-2xl mb-5 "
      >
        <div className="mb-8">
          <label
            htmlFor="waste-image"
            className="block text-lg text-gray-700 mb-2"
          >
            Upload Waste Image
          </label>
          <div
            className="flex mt-1 justify-center px-6 pt-5 pb-5 border-2 border-green-800 border-dashed rounded-xl
          hover:border-green-500 transition-all duration-900
           "
          >
            <div className="space-y-1 text-center">
              <Upload className="h-5 w-5 text-gray-500 mx-auto my-auto" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="waste-image"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600
              hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-50
              "
                >
                  <span>Upload a File </span>
                  <input
                    id="waste-image"
                    name="waste-image"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
                <p className="pl-1"> or drag and drop</p>
              </div>
              <p className="text-xs text-green-900">PNG,JPG,GIF up to 10 MB</p>
            </div>
          </div>
        </div>

        {preview && (
          <div className="mt-4 mb-8 w-full">
            <img
              src={preview}
              alt="Waste preview"
              className="max-w-full h-auto rounded-xl shadow-md"
            />
          </div>
        )}
        <Button
          type="button"
          onClick={handleVerify}
          className="w-full mb-8 flex justify-center items-center bg-green-700 hover:bg-green-500 hover:text-black
        rounded-xl transition-colors  duration-300"
          disabled={!file || verificationStatus === "verifying"}
        >
          {verificationStatus === "verifying" ? (
            <>
              <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              verifying.....
            </>
          ) : (
            "Verify Waste"
          )}
        </Button>

        {verificationStatus === "success" && verificationResult && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 rounded-r-xl">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-800">
                  Verification Successful
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Waste Type: {verificationResult.wasteType}</p>
                  <p>Quantity: {verificationResult.quantity}</p>
                  <p>
                    Confidence:{" "}
                    {(verificationResult.confidence * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-gray-800">
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location
            </label>
            {isLoaded ? (
              <StandaloneSearchBox
                onLoad={onLoad}
                onPlacesChanged={onPlacesChanged}
              >
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newReport.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                  placeholder="Enter waste location"
                />
              </StandaloneSearchBox>
            ) : (
              <input
                type="text"
                id="location"
                name="location"
                value={newReport.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                placeholder="Enter waste location"
              />
            )}
          </div>
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Waste Type
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={newReport.type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 bg-gray-100"
              placeholder="Verified waste type"
              readOnly
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Estimated Amount
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={newReport.amount}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 bg-gray-100"
              placeholder="Verified amount"
              readOnly
            />
          </div>
        </div>

        <Button
          type="submit"
          className="bg-gray-800 hover:bg-gray-500 w-full text-white 
        "
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-300" />
              verifying.....
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>

      <h2 className="text-center font-semibold text-3xl text-gray-700 mb-6">
        Recent Reports
      </h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gray-400 max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  DAte
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports?.map((report: any) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <MapPin className="inline-block w-4 h-4 mr-2 text-green-500" />
                    {report.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.wasteType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
