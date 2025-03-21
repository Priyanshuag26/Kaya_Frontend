import { useState, useEffect } from "react";
import { BsRobot } from "react-icons/bs";
import NeedHelpImage from './assets/NeedHelp.png';
import SendImage from './assets/Send.png';
import { IoCloseCircleSharp } from "react-icons/io5";
// import LanguageDropdown from "./LanguageDropdown";
import { useTranslation } from "react-i18next";
import { IoIosArrowBack } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { FaMicrophone } from 'react-icons/fa';
import { postAPI } from './caller/axiosUrls';
import axios from 'axios';
// import { fetchNearbyStores } from './component/FetchNearbyStores';
import Markdown from "react-markdown";
import PulseLoader from "react-spinners/PulseLoader";
import './App.css';
import 'animate.css';
import Form from "./component/Form"
import handleSubmit from "./component/Form"; // Adjust the correct path
const App = () => {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => {
        setIsListening(true);
    };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
    };
    recognition.onend = () => {
        setIsListening(false);
    };
    const handleVoiceInput = () => {
        if (!isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }
    };
    const [isFAQOpen, setIsFAQOpen] = useState(false);
    const [isHelpPageOpen, setIsHelpPageOpen] = useState(false);
    const [isChatStarted, setIsChatStarted] = useState(false);
    const { t, i18n } = useTranslation();
    const [openFAQIndex, setOpenFAQIndex] = useState(null);
    const [openHelpPageIndex, setHelpPageIndex] = useState(null);
    const [messages, setMessages] = useState([]);
    const [sender, setSender] = useState(false);
    const [input, setInput] = useState("");
    const [displayedMessages, setDisplayedMessages] = useState([]); // Messages being shown
    const [typingMessage, setTypingMessage] = useState(""); // For letter-by-letter effect
    const [isFormVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState(null);
    const [followup, setFollowup] = useState([]);
    const [followup2, setFollowup2] = useState([]);
    const [followup3, setFollowup3] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [conversationalMode, setConversationalMode] = useState(false);
    const [DateTimeMode, setDateTimeMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [sessionData, setSessionData] = useState({
        name: null,
        email: null,
        phone: null,
        service: null,
        location: null,
        storeid: null
    });
    const [sessionData2, setSessionData2] = useState({
        date: null,
        time: null
    });
    const [prevResponseData, setPrevResponseData] = useState({
        disease_name: '',
        service_name: ''
    });
    const handleFormCancel = () => {
        setFormVisible(false); // Close the form without submitting
        setFollowup([]);
    };
    const handleFAQClick = (index) => {
        setOpenFAQIndex(prevIndex => prevIndex === index ? null : index);
    };
    const handleHelpTabClick = (index) => {
        setHelpPageIndex(prevIndex => prevIndex === index ? null : index);
    };

    const botQuery = async (query) => {
        setSender(true);
        try {
            // Prepare the request body for API call
            const requestBody = {
                query: query,          // The user query
                followup: followup     // Existing followup history
            };
            console.log(requestBody)
            // Make the API call
            const response = await postAPI(`/query/`, requestBody);
            console.log("API Response:", response);
            // Append both the user query and the bot's response to followup history
            const updatedFollowup = [
                ...followup,
                { user_query: query, bot_response: response.response }
            ];
            // Keep only the last two interactions
            if (updatedFollowup.length > 2) {
                updatedFollowup.splice(0, updatedFollowup.length - 2);
            }
            // Update followup state
            setFollowup(updatedFollowup);
            // Preserve previous data if new values are empty/null
            setPrevResponseData((prevData) => {
                const newData = {
                    disease_name: response.disease_name
                        ? response.disease_name
                        : prevData.disease_name,

                    service_name: response.service_name
                        ? response.service_name
                        : prevData.service_name,
                };
                console.log("Updated prevResponseData:", newData);
                return newData;
            });
            // If the intent is "Appointment Scheduling", show the form
            if (response.intent === "Appointment Scheduling") {
                if (!(response.service_name?.trim()) && !(prevResponseData.service_name?.trim())) {
                    setMessages([
                        ...messages,
                        { text: input, sender: "user" },
                        { text: t("Please tell us about your problem first!"), sender: "bot", speaker: false },
                    ]);
                    setFollowup([]);
                    return;
                }
                try {
                    // Ask user how they want to proceed
                    setMessages([
                        ...messages,
                        { text: input, sender: "user" },
                        { text: t("How would you like to proceed?"), sender: "bot", speaker: false }
                    ]);
                    // Delay adding buttons slightly for better UI experience
                    setTimeout(() => {
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            {
                                text: "📝 Fill form manually",
                                sender: "bot",
                                isButton: true,
                                actionType: "manual"
                            },
                            {
                                text: "💬 Fill via conversation",
                                sender: "bot",
                                isButton: true,
                                actionType: "conversation"
                            }
                        ]);
                    }, 500);
                } catch (error) {
                    console.error("Error handling appointment scheduling intent:", error);
                    setMessages([...messages, { text: "⚠️ Something went wrong. Please try again.", sender: "bot" }]);
                } finally {
                    console.log("Appointment Scheduling process attempted.");
                }

                return;
            }
            return response.response;
        } catch (error) {
            console.error("API Error:", error);
            toast.error("Couldn't connect to chatbot! Please try later.");
        } finally {
            setSender(false);
        }
    };
    const handleSelection = async (mode) => {
        if (mode === "manual") {
            setFormVisible(true);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: "📝 Fill form manually", sender: "user" },
                { text: "Sure, here is your booking form!", sender: "bot" }
            ]);
        } else if (mode === "conversation") {
            if (conversationalMode) return; // ✅ Prevent re-triggering if already active
            setConversationalMode(true);
            const requestBody = {
                query: "Start Appointment Booking",
                session_data: sessionData, // Track conversation progress
                service_name: prevResponseData.service_name,
                followup: [],
                longitude: 77.044202,
                latitude: 28.411796
            };

            // console.log("Sending to Conversation API:", JSON.stringify(requestBody, null, 2));

            const response = await fetch("http://localhost:8000/conv/book_appointment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
            const data = await response.json();

            setCurrentStep(0);
            
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: data.message, sender: "bot", speaker: true }
            ]);

        }
    };
    const getUserLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        resolve({ latitude: null, longitude: null }); // Resolve with null if error
                    }
                );
            } else {
                console.error("Geolocation not supported.");
                resolve({ latitude: null, longitude: null }); // Resolve with null if unsupported
            }
        });
    };
    const handleSendMessage = async () => {
        if (sender) return;

        try {
            if (!input.trim()) return; // Prevent sending empty messages

            if (!isChatStarted) setIsChatStarted(true);

            setMessages([...messages, { text: input, sender: "user" }]);
            const userMessage = input;
            setInput(""); // Clear input field

            getUserLocation().then(async ({ latitude, longitude }) => {
                console.log("User Location:", latitude, longitude);
                if(DateTimeMode){
                    const requestBody = {
                        query: userMessage,
                        store_id: sessionData.storeid,
                        session_data: sessionData2,
                        followup: followup3 // Assuming there's no follow-up required
                    };
                    console.log("Request Body:", requestBody);


                    try {
                        const confirmResponse = await fetch("http://localhost:8000/book_slot_conversation", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(requestBody)
                        });

                        const confirmData = await confirmResponse.json();  // FIXED: Correct method to extract JSON response
                        console.log(confirmData)
                        const updatedFollowup3 = [
                            ...followup3,
                            { user_query: userMessage, bot_response: confirmData.message }
                        ];
                        if (updatedFollowup3.length > 2) {
                            updatedFollowup3.splice(0, updatedFollowup3.length - 2);
                        }
                        setFollowup3(updatedFollowup3);
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            { text: confirmData.message, sender: "bot", speaker: true }  // FIXED: Use confirmData.message
                        ]);
                        if (confirmData.details) {
                            setSessionData2((prevSession) => ({
                                ...prevSession,
                                ...confirmData.details
                            }));
                        }
                        if(confirmData.status == "confirmed"){
                            const appointmentDetails = {
                                name: sessionData.name,
                                email: sessionData.email,
                                phone_no: sessionData.phone,
                                service_name: sessionData.service,
                                disease_name: prevResponseData.disease_name,
                                store_id: sessionData.storeid,
                                appointment_date: sessionData2.date,
                                appointment_time: confirmData.details.time
                            };

                            console.log("Submitting appointment details:", appointmentDetails);

                            try {
                                // setLoading(true);
                                // setError('');

                                const response = await axios.post('http://localhost:8000/saveUserInfo/', appointmentDetails);


                                console.log("API Response:", response);

                                if (response) {
                                    // setFormVisible(false);
                                    setMessages((prevMessages) => [
                                        ...prevMessages,
                                        { text: "Confirmation Email sent to you successfully", sender: "bot", speaker: true }]); // FIXED: Use confirmData.message
                                    
                                    
                                }
                            } catch (err) {
                                // setError(err.message || 'Failed to book the appointment');
                                console.error("Error booking appointment:", err);
                            } finally {
                                // setLoading(false);
                                // setFollowup([]);
                            }
                        }
                    } catch (error) {
                        console.error("Error confirming appointment:", error);
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            { text: "Something went wrong while confirming your appointment.", sender: "bot", speaker: true }
                        ]);

                    }
                }
                else if (conversationalMode) {
                    // 🟢 Call conversation API
                    const requestBody = {
                        query: userMessage,
                        session_data: sessionData,
                        service_name: prevResponseData.service_name,
                        followup: followup2,
                        longitude: longitude,
                        latitude: latitude
                    };

                    console.log("Sending to Conversation API:", JSON.stringify(requestBody, null, 2));

                    try {
                        const response = await fetch("http://localhost:8000/conv/book_appointment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(requestBody)
                        });

                        // Check if response is not ok (status code not in range 200-299)
                        if (!response.ok) {
                            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
                        }

                        const data = await response.json();
                        console.log("Response from Conversation API:", data);

                        if (data.details) {
                            setSessionData((prevSession) => ({
                                ...prevSession,
                                ...data.details
                            }));
                        }
                        const updatedFollowup2 = [
                            ...followup2,
                            { user_query: userMessage, bot_response: data.message }
                        ];
                        if (updatedFollowup2.length > 2) {
                            updatedFollowup2.splice(0, updatedFollowup2.length - 2);
                        }
                        setFollowup2(updatedFollowup2);

                        if (data.status == "pending") {
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                { text: data.message, sender: "bot", speaker: true }
                            ]);
                        }
                        if (data.status === "confirmed") {
                            console.log("Appointment confirmed. Calling additional API...");

                            const requestBody = {
                                query: "Give Slots Details For Booking",
                                store_id: data.details.storeid,
                                session_data: sessionData2,
                                followup: []  // Assuming there's no follow-up required
                            };
                            console.log("Request Body:", requestBody);


                            try {
                                const confirmResponse = await fetch("http://localhost:8000/book_slot_conversation", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(requestBody)
                                });

                                const confirmData = await confirmResponse.json();  // FIXED: Correct method to extract JSON response

                                setMessages((prevMessages) => [
                                    ...prevMessages,
                                    { text: confirmData.message, sender: "bot", speaker: true }  // FIXED: Use confirmData.message
                                ]);
                                if (confirmData.details) {
                                    setSessionData2((prevSession) => ({
                                        ...prevSession,
                                        ...confirmData.details
                                    }));
                                }


                                setDateTimeMode(true);
                            } catch (error) {
                                console.error("Error confirming appointment:", error);
                                setMessages((prevMessages) => [
                                    ...prevMessages,
                                    { text: "Something went wrong while confirming your appointment.", sender: "bot", speaker: true }
                                ]);

                            }
                        }

                    } catch (error) {
                        console.error("Error in API request:", error.message);
                    }

                             
                    // 🟡 If status is 'confirmed', hit a different route and enable dateTimeMode
                    

                } else {
                    // 🔵 Default: Call botQuery for general queries
                    const answer = await botQuery(userMessage);

                    if (answer) {
                        setMessages([
                            ...messages,
                            { text: userMessage, sender: "user" },
                            { text: answer, sender: "bot", speaker: true }
                        ]);
                    }
                }
            });
        } catch (error) {
            setMessages([
                ...messages,
                { text: input, sender: "user" },
                { text: "Couldn't connect to chatbot! Please try later.", sender: "bot", speaker: false }
            ]);
            console.log(error.message);
        }
    };


    // FAQs for Home and Help tabs
    const homeFAQs = [
        {
            question: t("What services does Kaya Clinic offer?"),
            answer: t(
                "Kaya Clinic provides a wide range of dermatology and skincare treatments, including laser hair removal, acne treatment, anti-aging solutions, skin brightening, and hair care therapies. Our services are designed to cater to different skin and hair needs with personalized solutions."
            ),
        },
        {
            question: t("Are Kaya Clinic treatments safe?"),
            answer: t(
                "Yes, all treatments at Kaya Clinic are dermatologically tested and performed by experienced professionals using advanced technology. We follow strict safety protocols to ensure the best results with minimal risk."
            ),
        },
        {
            question: t("How do I book an appointment at Kaya Clinic?"),
            answer: t(
                "You can book an appointment through our website, mobile app, or by calling your nearest Kaya Clinic. Walk-ins are also welcome, but prior appointments are recommended for a smoother experience."
            ),
        },
        {
            question: t("What skin concerns does Kaya Clinic address?"),
            answer: t(
                "Kaya Clinic specializes in treating a variety of skin concerns, including acne, pigmentation, dark circles, fine lines, wrinkles, dull skin, and hair loss. Our expert dermatologists provide customized treatment plans for optimal results."
            ),
        },
        {
            question: t("Does Kaya Clinic offer personalized skincare solutions?"),
            answer: t(
                "Yes, Kaya Clinic provides personalized skincare and haircare regimens based on your skin type, concerns, and goals. Our dermatologists conduct in-depth consultations to recommend the best treatment and products suited for your needs."
            ),
        }
    ];
    const helpFAQs = [
        {
            question: t("How do I contact Kaya Clinic customer support?"),
            answer: t(
                "You can connect with our support team via email, toll-free number, or by visiting your nearest Kaya Clinic."
            ),
        },
        {
            question: t("What are Kaya Clinic's support hours?"),
            answer: t(
                "Our support team is available from 10 AM to 8 PM, Monday to Sunday."
            ),
        },
        {
            question: t("What types of concerns does Kaya Clinic's support team handle?"),
            answer: t(
                "We assist with appointment bookings, skincare consultations, treatment inquiries, and post-treatment care."
            ),
        },
        {
            question: t("What languages does Kaya Clinic provide assistance in?"),
            answer: t(
                "We offer support in English, Hindi, and regional languages based on availability."
            ),
        },
        {
            question: t("What is the average response time for customer inquiries?"),
            answer: t(
                "Our team responds within 30 minutes during working hours. Appointment-related queries may take up to 24 hours."
            ),
        },
    ];
    useEffect(() => {
        if (isChatbotOpen) {
            const chatBody = document.querySelector(".chat-body");
            if (chatBody) {
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        }
    }, [messages, isChatbotOpen]);
    return (
        <>
            {/* {!isChatbotOpen && <div onClick={() => setIsChatbotOpen(true)} className={`${!isChatbotOpen ? 'hidden md:block fixed' : 'hidden'} animate__fadeInDown z-30 bottom-[70px] right-[400px] text-sm px-3 py-1 animate__animated animate__pulse animate__slow animate__infinite`}>
                <p className="custom-popover">Click me, I'm here to assist!</p>
            </div>} */}
            <div className={`fixed z-10 max-w-[350px] overflow-hidden !ease-[cubic-bezier(0.77,0,0.175,1)] !duration-[400ms] flex flex-col items-center bottom-[20px] ${isChatbotOpen ? 'w-11/12 left-1/2 transform -translate-x-1/2 md:left-auto md:-translate-x-0 md:right-[20px] h-[450px] rounded-[18px] border-[2px] border-[#EBECED] bg-white shadow-2xl' : 'justify-center right-[20px] w-[60px] h-[60px] opacity-80 cursor-pointer hover:opacity-100 rounded-[50%] bg-black'}`}>
                {
                    isChatbotOpen ?
                        <>
                            <div className="w-full bg-black shadow-md px-5 flex justify-between items-center shadow min-h-[60px]">

                                <div className="flex gap-x-3 items-center">
                                    <p className="text-white text-[16px] font-semibold">{t('KayaBot')}</p>
                                    <BsRobot className="text-white mb-1 text-[24px]" />
                                </div>
                                <div className="flex gap-x-5 items-center">
                                    <div className="cursor-pointer flex flex-col items-center justify-center" onClick={() => {
                                        setIsHelpPageOpen(true);
                                        setIsFAQOpen(false);
                                    }}>
                                        <img className="w-[25%] object-contain" src={NeedHelpImage} alt="Need Help Image" />
                                        <p className="text-[10px] text-white font-medium">{t('Need Help?')}</p>
                                    </div>
                                    <IoCloseCircleSharp onClick={() => {
                                        setIsChatbotOpen(false);
                                        setIsFAQOpen(false);
                                        setIsHelpPageOpen(false);
                                    }} className="cursor-pointer text-white text-[20px]" />
                                </div>
                            </div>
                            <div className="rounded-b-[12px] w-full flex justify-between items-center border-b border-[#EBECED] px-[1rem] py-[0.5rem]">
                                <div className="flex items-center gap-x-[10px]">
                                    <button onClick={() => location.href = "https://www.kaya.in/contact-us"} className="cursor-pointer bg-[#F5F5F5] rounded-[30px] text-[13px] px-[6px] py-[1px]">{t('Contact Us')}</button>
                                    <button onClick={() => {
                                        setIsFAQOpen(true);
                                        setIsHelpPageOpen(false);
                                    }} className="cursor-pointer bg-[#F5F5F5] rounded-[30px] text-[13px] px-[6px] py-[1px]">{t('FAQ')}</button>
                                </div>
                                {/* <LanguageDropdown /> */}
                            </div>
                            <div className="grow relative flex flex-col px-[18px]">
                                <div className={`noscroll !duration-600 z-30 absolute flex-col bg-white top-0 left-1/2 -translate-x-1/2 overflow-auto min-w-full ${isFAQOpen ? 'h-full grow flex' : 'h-0 grow-0'}`}>
                                    <div className="flex items-center px-5 pt-5">
                                        <IoIosArrowBack className="text-xl text-[#000000] min-w-[20px] min-h-[20px] cursor-pointer" onClick={() => {
                                            setIsFAQOpen(false);
                                            setIsHelpPageOpen(false);
                                            setOpenFAQIndex(null);
                                        }} />
                                        <p className="text-[#000000] font-semibold grow text-center mr-[20px]">FAQs</p>
                                    </div>
                                    <div className="flex flex-col mt-5 px-5 pb-5">
                                        {homeFAQs.map((FAQ, index) => {
                                            return (
                                                <div key={'FAQ-' + index}>
                                                    <div
                                                        className="flex items-center text-[#000000] text-[12px] rounded-[30px] cursor-pointer border border-[#2E5BFF47] py-[0.5rem] px-[1rem]"
                                                        onClick={() => handleFAQClick('FAQ-' + index)}>
                                                        <p className="w-full">{FAQ.question}</p>
                                                        <FaChevronDown className={`${openFAQIndex === 'FAQ-' + index ? "rotate-180" : ""} transition-transform`} />
                                                    </div>
                                                    <div className={`${openFAQIndex === 'FAQ-' + index ? 'max-h-fit py-[1rem] px-[1rem] border border-[#2E5BFF47] mb-3' : 'max-h-0 p-0 border-0'} transition-all duration-300 overflow-hidden mt-2 items-center bg-[#000000] text-white shadow-xl text-[12px] rounded-[18px] cursor-pointer`}>
                                                        <p>{FAQ.answer}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className={`noscroll !duration-600 z-30 absolute flex-col bg-white top-0 left-1/2 -translate-x-1/2 overflow-auto min-w-full ${isHelpPageOpen ? 'h-full grow flex' : 'h-0 grow-0'}`}>
                                    <div className="flex items-center px-5 pt-5">
                                        <IoIosArrowBack className="text-xl text-[#000000] min-w-[20px] min-h-[20px] cursor-pointer" onClick={() => {
                                            setIsHelpPageOpen(false);
                                            setIsFAQOpen(false);
                                            setHelpPageIndex(null);
                                        }} />
                                        <p className="text-[#000000] font-semibold grow text-center mr-[20px]">Need Help?</p>
                                    </div>
                                    <div className="flex flex-col mt-5 px-5 pb-5">
                                        {helpFAQs.map((help, index) => {
                                            return (
                                                <div key={'Help-' + index}>
                                                    <div className="flex items-center text-[#000000] text-[12px] rounded-[30px] cursor-pointer border border-[#2E5BFF47] py-[0.5rem] px-[1rem]" onClick={() => handleHelpTabClick('Help-' + index)}>
                                                        <p className="w-full">{help.question}</p>
                                                        <FaChevronDown className={`${openHelpPageIndex === 'Help-' + index ? "rotate-180" : ""} transition-transform`} />
                                                    </div>
                                                    <div className={`${openHelpPageIndex === 'Help-' + index ? 'max-h-fit py-[1rem] px-[1rem] border border-[#2E5BFF47] mb-3' : 'max-h-0 p-0 border-0'} transition-all duration-300 overflow-hidden mt-2 items-center bg-[#000000] text-white shadow-xl text-[12px] rounded-[18px] cursor-pointer`}>
                                                        <p>{help.answer}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className={`noscroll !duration-600 z-30 absolute flex-col bg-white top-0 left-1/2 -translate-x-1/2 overflow-auto min-w-full ${isFormVisible ? 'h-full grow flex' : 'h-0 grow-0'}`}>
                                    <div className="flex items-center px-5 pt-5">
                                        <IoIosArrowBack className="text-xl text-[#000000] min-w-[20px] min-h-[20px] cursor-pointer" onClick={() => {
                                            setFormVisible(false);
                                            setIsFAQOpen(false);
                                            setIsHelpPageOpen(false);
                                            setHelpPageIndex(null);
                                            setOpenFAQIndex(null);
                                        }} />
                                        <p className="text-[#000000] font-semibold grow text-center mr-[20px]">Sure here is your booking form!</p>
                                    </div>
                                    <div className="flex flex-col items-center px-4 py-2 w-full max-w-lg">
                                        <Form
                                            isFormVisible={isFormVisible}
                                            diseaseName={prevResponseData.disease_name}
                                            serviceName={prevResponseData.service_name}
                                            onSubmit={handleSubmit}
                                            onCancel={handleFormCancel}
                                            setFollowup={setFollowup}
                                            setFormVisible={setFormVisible}
                                            setMessages={setMessages}
                                            messages={messages}
                                            userLocation={userLocation}
                                        />
                                    </div>
                                </div>
                                <div className={`${isChatStarted || isFAQOpen || isHelpPageOpen ? 'opacity-0' : 'opacity-100'} z-10 !duration-[1s] delay-200 grow flex flex-col items-center justify-center`}>
                                    <p className="text-[17px] text-center font-semibold text-[#4B4B4B]">
                                        {t('Welcome to Kaya Clinic')}</p>
                                    <p className="mt-2 text-[13px] text-center text-black">
                                        {i18n.language === 'en' ? "Your Ultimate Destination for Skin and Hair Care Solutions in India!" : t("waamt1csp")}
                                    </p>

                                </div>
                                <div className={`!duration-[1s] z-20 absolute flex-col bg-white bottom-0 left-1/2 -translate-x-1/2 min-w-full ${isChatStarted ? 'h-full grow flex' : 'h-0 grow-0'}`}>
                                    <div className="noscroll chat-body flex flex-col px-5 pt-4 overflow-auto">
                                        {messages.map((message, index) => (
                                            <div
                                                key={'Message-' + index}
                                                className={`mb-3 ${message.sender === 'user' ? 'self-end' : 'self-start'} ${message.isButton ? 'w-full' : 'w-fit'}`}  // Only full width for buttons
                                            >
                                                <div className={`px-3 flex animate__animated flex-col py-2 rounded-[20px] break-words text-sm ${message.sender === 'user' ? 'bg-[#000000] text-white rounded-br-none animate__fadeInRight' :
                                                        'bg-[#F4F4F4] text-black rounded-bl-none animate__fadeInLeft'} ${message.isButton ? 'w-full' : 'w-fit'}`}  // Button takes full width, text remains fit
                                                >

                                                    {/* Render text messages normally */}
                                                    {!message.isButton && <Markdown>{message.text}</Markdown>}

                                                    {/* Render button messages with full width */}
                                                    {message.isButton && (
                                                        <button
                                                            className="mt-2 px-5 py-3 w-full block bg-gradient-to-r from-green-200 to-green-300 text-black rounded-lg shadow-md hover:from-green-300 hover:to-green-400 transition-all duration-300 transform hover:scale-105"
                                                            onClick={() => handleSelection(message.actionType)}
                                                        >
                                                            {message.text}
                                                        </button>

                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {sender ? (
                                            <PulseLoader color="#000000" size={10} className="mb-3" />
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <div className={`${isFAQOpen || isHelpPageOpen || isFormVisible ? '!translate-y-[120px] !h-0' : '!translate-y-0 h-[120px]'} !duration-[1s] overflow-hidden w-full ${isChatStarted ? 'px-0 h-fit' : 'px-[20px]'} flex flex-col items-center justify-center`}>
                                <div className={`border w-full flex py-[0.6rem] gap-2 px-[1rem] border-[#EBECED] ${isChatStarted ? 'rounded-t-[18px]' : 'rounded-[18px]'}`}>
                                    <button onClick={handleVoiceInput} className={`mr-2  rounded-full flex justify-center items-center ${isListening ? 'bg-red-500' : 'bg-gray-500'} min-w-[32px] min-h-[32px] border-[2px] border-[#EBECED] cursor-pointer`}>
                                        <FaMicrophone className="text-white" />
                                    </button>
                                    <input type="text" onChange={(e) => setInput(e.target.value)} value={input} onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSendMessage();
                                    }} className="grow focus:outline-hidden border-none pr-[30px]" placeholder="What can I help you with?" />
                                    <button className={`hover:scale-110 active:scale-90 rounded-full flex justify-center items-center  ${input.trim().length === 0 ? 'bg-[#F0F0F0]' : 'bg-[#0038A8]'}  min-w-[32px] min-h-[32px] border-[2px] border-[#EBECED] cursor-pointer `} onClick={handleSendMessage}>
                                        <img className="w-[14px] h-[14px] color-[#F0F0F0]  " src={SendImage} alt="Send Image" />
                                    </button>
                                </div>
                                <div className={`${isChatStarted ? 'translate-y-[100px] h-0' : 'translate-y-0 h-[30px] mt-[10px]'} !duration-[1s] noscroll w-full overflow-x-auto flex flex-nowrap gap-x-[5px] rounded-[15px]`}>
                                    <button onClick={() => location.href = "https://www.kaya.in/about-us/"}
                                        className="text-black cursor-pointer whitespace-nowrap text-center border border-[#D1D5DB] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[13px] font-medium rounded-[15px] py-[0.2rem] px-[0.6rem]">
                                        {t('About Us')}
                                    </button>
                                    <button onClick={() => location.href = "https://www.kaya.in/investors/#kaya_company"}
                                        className="text-black cursor-pointer whitespace-nowrap text-center border border-[#D1D5DB] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[13px] font-medium rounded-[15px] py-[0.2rem] px-[0.6rem]">
                                        {t('Our Team')}
                                    </button>
                                    <button onClick={() => location.href = "https://www.kaya.in/blog/"}
                                        className="text-black cursor-pointer whitespace-nowrap text-center border border-[#D1D5DB] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[13px] font-medium rounded-[15px] py-[0.2rem] px-[0.6rem]">
                                        {t('Blog')}
                                    </button>
                                    <button onClick={() => location.href = "https://www.kaya.in/investors/#recruitment"}
                                        className="text-black cursor-pointer whitespace-nowrap text-center border border-[#D1D5DB] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[13px] font-medium rounded-[15px] py-[0.2rem] px-[0.6rem]">
                                        {t('Careers')}
                                    </button>
                                </div>

                            </div>
                        </> :
                        <BsRobot onClick={() => setIsChatbotOpen(true)} className="text-white text-[32px] mb-1" />
                }
            </div>
        </>
    )
}
export default App;
