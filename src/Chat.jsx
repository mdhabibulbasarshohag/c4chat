import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://c4chat-server.vercel.app/");

const Chat = () => {
    const { user, signInWithGoogle, logout } = useAuth();
    const [friendEmail, setFriendEmail] = useState("");
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [currentFriend, setCurrentFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Emit an event when the user is online
        if (user) {
            socket.emit("setOnline", user.email);
        }

        // Listen for updates to active status
        socket.on("updateOnlineStatus", (data) => {
            setFriends((prevFriends) =>
                prevFriends.map((friend) =>
                    friend.email === data.email
                        ? { ...friend, online: data.status === "online" }
                        : friend
                )
            );
        });

        return () => {
            socket.off("updateOnlineStatus");
        };
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchFriends();
            fetchFriendRequests();
        }
    }, [user]);

    const fetchFriends = async () => {
        const res = await axios.get(`https://c4chat-server.vercel.app//friends/${user.email}`);
        setFriends(res.data);
    };

    const fetchFriendRequests = async () => {
        const res = await axios.get(`https://c4chat-server.vercel.app//friendRequests/${user.email}`);
        setFriendRequests(res.data);
    };

    const sendFriendRequest = async () => {
        await axios.post("https://c4chat-server.vercel.app//sendFriendRequest", { senderEmail: user.email, receiverEmail: friendEmail });
        alert("Friend request sent!");
        setFriendEmail("");
    };

    const acceptFriendRequest = async (friendEmail) => {
        await axios.post("https://c4chat-server.vercel.app//acceptFriendRequest", { userEmail: user.email, friendEmail });
        fetchFriends();
        fetchFriendRequests();
    };

    const fetchMessages = async (friend) => {
        setCurrentFriend(friend);
        const res = await axios.get(`https://c4chat-server.vercel.app//messages?sender=${user.email}&receiver=${friend.email}`);
        setMessages(res.data);
    };

    useEffect(() => {
        socket.on("receiveMessage", (data) => {
            if ((data.sender === user.email && data.receiver === currentFriend?.email) ||
                (data.sender === currentFriend?.email && data.receiver === user.email)) {
                setMessages((prev) => [...prev, data]);
            }
        });

        return () => socket.off("receiveMessage");
    }, [currentFriend]);

    const sendMessage = () => {
        if (message.trim() && currentFriend) {
            const msgData = { sender: user.email, receiver: currentFriend.email, message };
            socket.emit("sendMessage", msgData);
            setMessages((prev) => [...prev, msgData]);
            setMessage("");
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-80 bg-white shadow-md py-4 px-6 flex flex-col">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Friends</h1>
                <input
                    type="text"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    placeholder="Enter friend's email"
                    className="p-2 border rounded w-full mb-4"
                />
                <button
                    onClick={sendFriendRequest}
                    className="p-2 bg-blue-500 text-white w-full rounded mb-4 hover:bg-blue-600 transition ease-in-out"
                >
                    Add Friend
                </button>

                <h2 className="text-lg font-semibold mb-2">Friend Requests</h2>
                {friendRequests.map(req => (
                    <div key={req.email} className="flex justify-between items-center mb-2">
                        <span>{req.email}</span>
                        <button
                            onClick={() => acceptFriendRequest(req.email)}
                            className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition ease-in-out"
                        >
                            Accept
                        </button>
                    </div>
                ))}

                <h2 className="text-lg font-semibold mb-2">Friends List</h2>
                {friends.map(friend => (
                    <button
                        key={friend.email}
                        onClick={() => fetchMessages(friend)}
                        className="flex items-center p-2 w-full text-left border rounded mb-2 hover:bg-gray-200 transition ease-in-out"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-300 mr-4"></div>
                        <span>{friend.email} {friend.online ? "(Online)" : "(Offline)"}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 bg-gray-50 p-6 flex flex-col">
                {!user ? (
                    <div className="flex justify-center items-center h-full">
                        <button
                            onClick={signInWithGoogle}
                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition ease-in-out"
                        >
                            Log in with Google
                        </button>
                    </div>
                ) : (
                    <>
                        {currentFriend && (
                            <div className="flex-1 bg-white shadow-lg rounded-lg flex flex-col">
                                <div className="flex justify-between items-center border-b py-4 px-6">
                                    <h2 className="text-xl font-semibold">{currentFriend.email}</h2>
                                    <button
                                        onClick={logout}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Logout
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                                    {messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 my-2 rounded-lg ${msg.sender === user.email ? "bg-blue-500 text-white ml-auto" : "bg-gray-300 text-black mr-auto"}`}
                                        >
                                            <strong>{msg.sender}</strong>: {msg.message}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 flex items-center bg-white border-t">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="p-2 border rounded w-full"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="p-2 bg-blue-500 text-white rounded ml-2 hover:bg-blue-600 transition ease-in-out"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;