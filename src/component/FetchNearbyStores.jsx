import axios from "axios";
import { toast } from "react-toastify";

export const fetchNearbyStores = async (userLocation, serviceName) => {
    try {
        console.log("func me" + serviceName);

        if (!serviceName.trim()) return;

        if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
            console.error("Invalid location data.");
            toast.error("Unable to fetch your location.");
            return;
        }

        const requestBody = {
            service_name: serviceName,  // Ensure serviceName exists
            latitude: parseFloat(userLocation.latitude),  // Ensure it's a float
            longitude: parseFloat(userLocation.longitude) // Ensure it's a float
        };

        console.log("Sending request:", requestBody);

        const response = await axios.post("http://localhost:8000/fetchNearByStores/", requestBody);

        console.log("Nearby Stores:", response.data);

        return response.data.nearby_stores; // Returns the list of stores
    } catch (error) {
        console.error("Error fetching nearby stores:", error.response ? error.response.data : error.message);
        toast.error("Failed to fetch nearby stores. Please try again.");
    }
};


