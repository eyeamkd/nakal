/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // For notifications

export default function Matches() {
  const [matches, setMatches] = useState({
    ongoing: [],
    upcoming: [],
    past: [],
  });

  const [activeTab, setActiveTab] = useState('ongoing');

  useEffect(() => {
    fetchMatches('ongoing');
    fetchMatches('upcoming');
    fetchMatches('past');
  }, []);

  const fetchMatches = async (category:any) => {
    try {
      let url = '/api/matches';
      if (category !== 'ongoing') {
        url += `?category=${category}`;
      }
      const { data } = await axios.get(url);
      setMatches((prev) => ({ ...prev, [category]: data }));
    } catch (error) { 
      console.log(error);
      toast.error('Failed to load matches');
    }
  };

  const handleCreateEvent = async () => {
    try {
      await axios.post('/api/matches', {
        // Event details to be posted
      });
      toast.success('Event created successfully!');
      fetchMatches('ongoing'); // Optionally refresh
    } catch (error) { 
      console.log(error);
      toast.error('Failed to create event');
    }
  };

  const copyToClipboard = (text:any) => {
    navigator.clipboard.writeText(text);
    toast.success('Fight ID copied to clipboard');
  };

  const renderMatches = (matchesList:any) => {
    return matchesList.map((match:any) => (
      <div key={match.fight_info.fightId} className="border p-4 rounded-lg shadow-md mb-4">
        <h3 className="text-lg font-semibold">{match.fight_info.red_name} vs {match.fight_info.blue_name}</h3>
        <p>Date: {match.fight_info.date}</p>
        <p>Result: {match.fight_info.result}</p>
        <p>Winner: {match.fight_info.winner}</p>
        <p>Cancelled: {match.fight_info.cancelled ? 'Yes' : 'No'}</p>
        <p>Started: {match.fight_info.started ? 'Yes' : 'No'}</p>
        <button
          onClick={() => copyToClipboard(match.fight_info.fightId)}
          className="text-blue-600 underline"
        >
          Copy Fight ID
        </button>
      </div>
    ));
  };

  return (
    <div className="container mx-auto p-8">
      <button
        onClick={handleCreateEvent}
        className="mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create Event
      </button>

      <div className="tabs mb-8">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`py-2 px-4 ${activeTab === 'ongoing' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Ongoing Matches
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-2 px-4 ${activeTab === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Upcoming Matches
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`py-2 px-4 ${activeTab === 'past' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Past Matches
        </button>
      </div>

      <div className="match-section">
        {activeTab === 'ongoing' && renderMatches(matches.ongoing)}
        {activeTab === 'upcoming' && renderMatches(matches.upcoming)}
        {activeTab === 'past' && renderMatches(matches.past)}
      </div>
    </div>
  );
}
