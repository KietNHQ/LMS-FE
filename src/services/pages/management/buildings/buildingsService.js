import axiosClient from "../../../shared/http/axiosClient";

export const buildingsService = {
  listBuildings: async () => {
    const response = await axiosClient.get("/buildings");
    const items = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.data)
      ? response.data.data
      : [];
    return items.map((b) => ({
      id: b.id,
      name: b.name || "",
      floors: b.floors || 1,
      description: b.description || "",
      isActive: b.is_active ?? true,
    }));
  },

  getBuildingById: async (id) => {
    const response = await axiosClient.get(`/buildings/${id}`);
    const item = response?.data || response;
    return item
      ? {
          id: item.id,
          name: item.name || "",
          floors: item.floors || 1,
          description: item.description || "",
          isActive: item.is_active ?? true,
        }
      : null;
  },

  createBuilding: async (data) => {
    const response = await axiosClient.post("/buildings", data);
    return response;
  },

  updateBuilding: async (id, data) => {
    const response = await axiosClient.put(`/buildings/${id}`, data);
    return response;
  },

  deleteBuilding: async (id) => {
    const response = await axiosClient.delete(`/buildings/${id}`);
    return response;
  },
};
