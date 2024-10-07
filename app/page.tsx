/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // For notifications

export default function Matches() {
  const [matches, setMatches] = useState({
    ongoing: [],
    upcoming: [],
    past: [],
  });

  const [activeTab, setActiveTab] = useState("ongoing");

  useEffect(() => {
    fetchMatches("ongoing");
    fetchMatches("upcoming");
    fetchMatches("past");
  }, []);

  const fetchMatches = async (category: any) => {
    try {
      let url = "/api/matches";
      if (category !== "ongoing") {
        url += `?category=${category}`;
      }
      const { data } = await axios.get(url);
      setMatches((prev) => ({ ...prev, [category]: data }));
    } catch (error) {
      console.log(error);
      toast.error("Failed to load matches");
    }
  };

  const handleCreateEvent = async () => {
    try {
      await axios.post("/api/matches", {
        // Event details to be posted
      });
      toast.success("Event created successfully!");
      fetchMatches("ongoing"); // Optionally refresh
    } catch (error) {
      console.log(error);
      toast.error("Failed to create event");
    }
  };

  const copyToClipboard = (text: any) => {
    navigator.clipboard.writeText(text);
    toast.success("Fight ID copied to clipboard");
  };

  const renderMatches = (matchesList: any) => {
    return matchesList.map((match: any) => (
      <div
        key={match.fight_info.fightId}
        className="border p-4 rounded-lg shadow-md mb-4"
      >
        <h3 className="text-lg font-semibold">
          {match.fight_info.red_name} vs {match.fight_info.blue_name}
        </h3>
        <p>Date: {match.fight_info.date}</p>
        <p>Result: {match.fight_info.result}</p>
        <p>Winner: {match.fight_info.winner}</p>
        <p>Cancelled: {match.fight_info.cancelled ? "Yes" : "No"}</p>
        <p>Started: {match.fight_info.started ? "Yes" : "No"}</p>
        <div className="flex items-center mt-2">
          <span className="mr-2">Fight ID:</span>
          <div
            className="flex items-center cursor-pointer bg-gray-100 hover:bg-gray-200 rounded px-2 py-1"
            onClick={() => copyToClipboard(match.fight_info.fightId)}
          >
            <span className="mr-2">{match.fight_info.fightId}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          </div>
        </div>
        <div className="flex items-center mt-2">
          <span className="mr-2">Get Stats:</span>
          <div
            className="flex items-center cursor-pointer bg-gray-100 hover:bg-gray-200 rounded px-2 py-1"
            onClick={() =>
              copyToClipboard(
                `curl https://nakal-pied.vercel.app/api/matches/${match.fight_info.fightId}/stats`
              )
            }
          >
            <code className="mr-2">
              curl https://nakal-pied.vercel.app/api/matches/{match.fight_info.fightId}/stats
            </code>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          </div>
        </div>
      </div>
    ));
  };

  const renderApiInstructions = () => {
    const apiCalls = [
      {
        description: "Create a match",
        curl: `curl -X POST https://nakal-pied.vercel.app/api/matches`,
      },
      {
        description: "Get all ongoing matches",
        curl: `curl https://nakal-pied.vercel.app/api/matches`,
      },
      {
        description: "Get all upcoming matches",
        curl: `curl https://nakal-pied.vercel.app/api/matches?category=upcoming`,
      },
      {
        description: "Get all past matches",
        curl: `curl https://nakal-pied.vercel.app/api/matches?category=past`,
      },
      {
        description: "Get match stats by fight ID",
        curl: `curl https://nakal-pied.vercel.app/api/matches/<fight_id>/stats`,
      },
    ];

    return (
      <div className="api-instructions mt-8 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">API Instructions</h2>
        {apiCalls.map((apiCall, index) => (
          <div key={index} className="mb-4">
            <p className="font-semibold text-white">{apiCall.description}</p>
            <div
              className="flex items-center cursor-pointer bg-gray-700 hover:bg-gray-600 rounded px-2 py-1"
              onClick={() => copyToClipboard(apiCall.curl)}
            >
              <code className="mr-2 text-white">{apiCall.curl}</code>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8"> 
          <h1 className="text-4xl font-bold text-center mb-8">Deepstrike Mock Server</h1>
          <h2 className="text-3xl font-bold mb-6">Matches</h2>
      <button
        onClick={handleCreateEvent}
        className="mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create Event
      </button>

      <div className="tabs mb-8">
        <button
          onClick={() => setActiveTab("ongoing")}
          className={`py-2 px-4 ${
            activeTab === "ongoing" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Ongoing Matches
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`py-2 px-4 ${
            activeTab === "upcoming" ? "bg-blue-500 text-white" : "bg-gray-600 "
          }`}
        >
          Upcoming Matches
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`py-2 px-4 ${
            activeTab === "past" ? "bg-blue-500 text-white" : "bg-gray-600"
          }`}
        >
          Past Matches
        </button>
      </div>

      <div className="match-section">
        {activeTab === "ongoing" && renderMatches(matches.ongoing)}
        {activeTab === "upcoming" && renderMatches(matches.upcoming)}
        {activeTab === "past" && renderMatches(matches.past)}
      </div>

      {renderApiInstructions()}
    </div>
  );
}