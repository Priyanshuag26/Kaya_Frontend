import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchNearbyStores } from './FetchNearbyStores';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";

const Form = ({ isFormVisible, serviceName, diseaseName, onSubmit, onCancel, setFollowup, setFormVisible, setMessages, messages }) => {
    const [name, setName] = useState('');
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    // const [address, setAddress] = useState('');
    const [phone_no, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const [timeSlots, setTimeSlots] = useState({});
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const [services] = useState([
        "Laser Hair Removal",
        "Beauty Facials",
        "Dull Skin/Circles",
        "De-Tanning",
        "Acne and Acne Scars",
        "Anti Ageing",
        "Hair Care",
        "Body Contouring",
        "Medical Concerns",
        "Skin Lightning",
        "Pigmentation",
    ]);
    const [selectedService2, setSelectedService2] = useState(serviceName);


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const appointmentDetails = {
            name,
            email,
            phone_no,
            service_name: selectedService2,
            disease_name: diseaseName,
            store_id: selectedStore,
            appointment_date: selectedDate,
            appointment_time: selectedTime
        };

        console.log("Submitting appointment details:", appointmentDetails);

        try {
            setLoading(true);
            setError('');

            const response = await axios.post('http://localhost:8000/saveUserInfo/', appointmentDetails);


            console.log("API Response:", response);

            if (response) {
                setFormVisible(false);

                setMessages([...messages,
                { text: t(`Your Appointment has been confirmed for ${serviceName} at ${selectedDate} at ${response.data.store_name}.`), sender: "bot", speaker: true },
                { text: "Confirmation Email sent to you successfully", sender: "bot", speaker: true }]);
            }
        } catch (err) {
            setError(err.message || 'Failed to book the appointment');
            console.error("Error booking appointment:", err);
        } finally {
            setLoading(false);
            setFollowup([]);
        }
    };

    const handleStoreSelect = async (storeId) => {
        setSelectedStore(storeId);
        if (storeId) {
            try {
                console.log("store id", storeId);
                console.log("reached this route")

                const response = await axios.get('http://127.0.0.1:8000/fetchSlot/', {
                    params: { store_id: storeId }  // ✅ Correct way to send query params
                });

                console.log("Received Time Slots:", response.data.available_slots);
                setTimeSlots(response.data.available_slots || {});
            } catch (err) {
                console.error("Error fetching time slots:", err.message);
            }
        }
    };
    const handleServiceSelect = async (service_name) => {

        setSelectedService2(service_name);
        const getStores = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log("User Location:", latitude, longitude);

                        try {
                            const nearbyStores = await fetchNearbyStores({ latitude, longitude }, service_name);
                            setStores(nearbyStores || []);
                        } catch (err) {
                            console.error("Error fetching stores:", err);
                        }
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                    }
                );
            } else {
                console.error("Geolocation not supported.");
            }
        };

        getStores();

    }
    useEffect(() => {
        if (serviceName) {
            setSelectedService2(serviceName);
        }
    }, [serviceName]);

    useEffect(() => {
        const getStores = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log("User Location:", latitude, longitude);

                        try {
                            const nearbyStores = await fetchNearbyStores({ latitude, longitude }, serviceName);
                            setStores(nearbyStores || []);
                        } catch (err) {
                            console.error("Error fetching stores:", err);
                        }
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                    }
                );
            } else {
                console.error("Geolocation not supported.");
            }
        };

        if (isFormVisible) getStores();
    }, [serviceName, isFormVisible]);

    return (
        <div className="p-6 bg-gray-50 rounded-xl shadow-md w-full max-w-lg text-gray-800 border border-gray-300 mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 mt-1 bg-white text-gray-800 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-400"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 mt-1 bg-white text-gray-800 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-400"
                        required
                    />
                </div>


                {/* Phone Number */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600">Phone Number</label>
                    <input
                        type="text"
                        value={phone_no}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 mt-1 bg-white text-gray-800 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-400"
                        required
                    />
                </div>

                {/* Service Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600">Select Service</label>
                    <select
                        value={selectedService2}
                        onChange={(e) => handleServiceSelect(e.target.value)}
                        className="w-full p-3 mt-1 bg-white text-gray-800 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-400"
                        required
                    >
                        <option value="">Select a service</option>
                        {services.map((service, index) => (
                            <option key={`service-${index}`} value={service}>
                                {service}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Store Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600">Select Nearby Store</label>
                    <select
                        value={selectedStore}
                        onChange={(e) => handleStoreSelect(e.target.value)}
                        className="w-full p-3 mt-1 bg-white text-gray-800 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-400"
                        required
                    >
                        <option value="">Select a store</option>
                        {stores.length > 0 &&
                            stores.map((store, index) => (
                                <option key={`store-${index}`} value={store.store_id}>
                                    {store.store_name} ({(store.distance / 1000).toFixed(1)} km)
                                </option>
                            ))}
                    </select>
                </div>


                {selectedStore && Object.keys(timeSlots).length > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-600">Select Date</label>
                        <DatePicker
                            selected={selectedDate ? new Date(selectedDate) : null}
                            onChange={(date) => {
                                if (date) {
                                    // Ensure local time formatting without timezone shifts
                                    const localDate = new Date(
                                        date.getFullYear(),
                                        date.getMonth(),
                                        date.getDate()
                                    );
                                    setSelectedDate(localDate.toISOString().split("T")[0]);
                                }
                            }}
                            className="w-full p-3 mt-1 bg-white text-gray-800 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-400"
                            minDate={new Date()} // Prevent past dates
                            dateFormat="yyyy-MM-dd"
                            includeDates={Object.keys(timeSlots).map((date) => new Date(date))} // Enable only available dates
                        />
                    </div>
                )}


                {/* Time Slot Selection */}
                {selectedDate && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-600">Select Time Slot</label>
                        {timeSlots[selectedDate]?.length > 0 ? (
                            <select
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-full p-3 mt-1 bg-white text-gray-800 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-400"
                                required
                            >
                                <option value="">Select a time</option>
                                {timeSlots[selectedDate]
                                    .filter((time) => new Date(`${selectedDate} ${time}`) > new Date()) // Prevent past slots
                                    .map((time, index) => (
                                        <option key={`time-${index}`} value={time}>
                                            {time}
                                        </option>
                                    ))}
                            </select>
                        ) : (
                            <p className="text-sm text-red-500 mt-1">No slots available for this date.</p>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

                {/* Submit & Cancel Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        type="submit"
                        className="w-28 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-28 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>



    );
};

export default Form;

