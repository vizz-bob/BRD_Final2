import { useState, useEffect } from "react";
import { teamService } from "../services/home";

export const useTeamPerformance = () => {
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeamPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await teamService.getPerformance();
      setTeamPerformance(data);
    } catch (err) {
      console.error("Failed to fetch team performance:", err);
      setError("Failed to load team performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamPerformance();
  }, []);

  return {
    teamPerformance,
    loading,
    error,
    refetch: fetchTeamPerformance
  };
};

export const useIndividualPerformance = (memberId) => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIndividualPerformance = async () => {
    if (!memberId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await teamService.getIndividualPerformance(memberId);
      setPerformance(data);
    } catch (err) {
      console.error("Failed to fetch individual performance:", err);
      setError("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndividualPerformance();
  }, [memberId]);

  return {
    performance,
    loading,
    error,
    refetch: fetchIndividualPerformance
  };
};
