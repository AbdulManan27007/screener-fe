import api from "./axios";

export const fetchTokens = async () => {
  try {
    const response = await api.get("/api/tokens");
    return response.data;
  } catch (error) {
    console.error("Error fetching market data:", error);
  }
};
export const fetchSingleToken = async (pairAddress) => {
  try {
    const response = await api.get(`/api/tokens/${pairAddress}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching market data:", error);
  }
};
export const fetchTransactions = async () => {
  try {
    const response = await api.get(`/api/transactions/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions data:", error);
  }
};
export const fetchTopTraders = async () => {
  try {
    const response = await api.get(`/api/topTraders/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions data:", error);
  }
};
