import constant from "../Utils/constant";

const signupApi = async (url, data) => {
    const requestOptions = {
        method: 'POST',
        body: data
    };

    return fetch(url, requestOptions)
        .then(response => response.json())
        .then(result => result)
        .catch(error => error);
};

const loginApi = async (url, data) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    };

    try {
        return fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => {
                let data = JSON.parse(result);
                return data;
            });

    } catch (error) {
        return { isSuccess: false, message: "Login failed. Please try again.", error };
    }
};


const fetchUsersApi = async (url) => {
    const token = localStorage.getItem("token");
    const requestOptions = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

    };

    try {
        return fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => {
                let data = JSON.parse(result);
                return data;
            });
    } catch (error) {
        console.error("Error fetching users:", error);
        return { message: "Error fetching users", error };
    }
};


const getConversationsApi = async () => {
    const token = localStorage.getItem("token");
    const requestOptions = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    };

    try {
        const response = await fetch(constant.conversationsUrl, requestOptions);
        return await response.json();
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
};

const markConversationReadApi = async (userId) => {
    const token = localStorage.getItem("token");
    const requestOptions = {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    };

    try {
        const response = await fetch(constant.markReadUrl.replace(':id', userId), requestOptions);
        return await response.json();
    } catch (error) {
        console.error("Error marking conversation as read:", error);
        return { success: false, error };
    }
};

const jsonAuthRequest = async (url, method, body) => {
    const token = localStorage.getItem("token");
    const requestOptions = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    };
    try {
        const response = await fetch(url, requestOptions);
        return await response.json();
    } catch (error) {
        console.error(`Error calling ${method} ${url}:`, error);
        return { success: false, error };
    }
};

const editMessageApi = (messageId, message) =>
    jsonAuthRequest(constant.editMessageUrl.replace(':id', messageId), 'PUT', { message });

const deleteMessageApi = (messageId, forEveryone) =>
    jsonAuthRequest(constant.deleteMessageUrl.replace(':id', messageId), 'DELETE', { forEveryone });

const forwardMessageApi = (messageId, receiverIds) =>
    jsonAuthRequest(constant.forwardMessageUrl.replace(':id', messageId), 'POST', { receiverIds });

const reactToMessageApi = (messageId, emoji) =>
    jsonAuthRequest(constant.reactMessageUrl.replace(':id', messageId), 'POST', { emoji });

const pinMessageApi = (messageId) =>
    jsonAuthRequest(constant.pinMessageUrl.replace(':id', messageId), 'PUT');

const unpinMessageApi = (messageId) =>
    jsonAuthRequest(constant.unpinMessageUrl.replace(':id', messageId), 'PUT');

const starMessageApi = (messageId) =>
    jsonAuthRequest(constant.starMessageUrl.replace(':id', messageId), 'PUT');

const unstarMessageApi = (messageId) =>
    jsonAuthRequest(constant.unstarMessageUrl.replace(':id', messageId), 'PUT');

const getStarredMessagesApi = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(constant.starredMessagesUrl, {
            method: 'GET',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching starred messages:", error);
        return [];
    }
};


const sendMessageApi = async (receiverId, newMessage, { replyTo, attachmentFile } = {}) => {

    const token = localStorage.getItem("token");

    const url = constant.sendMessageUrl.replace(":id", receiverId);

    let requestOptions;
    if (attachmentFile) {
        const formData = new FormData();
        formData.append("message", newMessage || "");
        if (replyTo) formData.append("replyTo", replyTo);
        formData.append("attachment", attachmentFile);
        requestOptions = {
            method: 'POST',
            headers: { "Authorization": `Bearer ${token}` },
            body: formData,
        };
    } else {
        requestOptions = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ message: newMessage, ...(replyTo ? { replyTo } : {}) })
        };
    }

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("Sent Message from API:", response);
        return await response.json();
    } catch (error) {
        console.error("Error sending message:", error);
        return { isSuccess: false, message: "Error sending message", error };
    }
};


const getMessageApi = async (userId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error(" No token found in localStorage");
        return { message: "Unauthorized access" };
    }

    const requestOptions = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    };

    try {
        const response = await fetch(`${constant.getMessageUrl.replace(":id", userId)}`, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { message: "Error fetching messages", error };
    }
};

const editProfileApi = async (userId, updatedData) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Handle fields
    formData.append("fullName", updatedData.fullName);
    formData.append("userName", updatedData.userName);
    formData.append("email", updatedData.email);
    formData.append("gender", updatedData.gender);
    formData.append("bio", updatedData.bio || "");

    //  Only if file is selected
    if (updatedData.profileImage instanceof File) {
        formData.append("profileImage", updatedData.profileImage);
    }

    const requestOptions = {
        method: 'PUT',
        headers: {
            "Authorization": `Bearer ${token}`, //  No Content-Type here
        },
        body: formData,
    };

    try {
        const response = await fetch(`${constant.editProfileApiUrl.replace(':id', userId)}`, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, message: "Error updating profile", error };
    }
};


// const editProfileApi = async (userId, updatedData) => {
//     const token = localStorage.getItem("token");
//     const formData = new FormData();

//     // Append data
//     Object.keys(updatedData).forEach((key) => {
//         formData.append(key, updatedData[key]);
//     });

//     const requestOptions = {
//         method: 'PUT',
//         headers: {
//             "Authorization": `Bearer ${token}`
//         },
//         body: formData,
//     };

//     try {
//         const response = await fetch(`${constant.editProfileApiUrl.replace(':id', userId)}`, requestOptions);
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return await response.json();
//     } catch (error) {
//         console.error("Error updating profile:", error);
//         return { success: false, message: "Error updating profile", error };
//     }
// };



const changePasswordApi = async (userId, oldPassword, newPassword) => {
    const token = localStorage.getItem("token");

    const requestOptions = {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
    };

    try {
        const response = await fetch(`${constant.changePasswordUrl.replace(':id', userId)}`, requestOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error changing password:", error);
        return { success: false, message: "Error changing password", error };
    }
};





const checkCredentialsApi = async (url, email) => {

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    };
    try {
        return fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => {
                let data = JSON.parse(result);
                return data;
            });
    } catch (error) {
        console.error("Find Email API Error:", error);
        return { isSuccess: false, message: "Something went wrong" };
    }
};


const verifyOtpApi = async (url, data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        return fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => JSON.parse(result));
    } catch (error) {
        console.error("OTP Verification API Error:", error);
        return { isSuccess: false, message: "Invalid OTP or server error." };
    }
};


const resetPasswordApi = async (url, data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        return fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => JSON.parse(result));
    } catch (error) {
        console.error("Password Reset API Error:", error);
        return { isSuccess: false, message: "Password reset failed. Try again." };
    }
};





const getCurrentUserApi = async () => {
    const token = localStorage.getItem("token");
    const requestOptions = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    };

    try {
        const response = await fetch(constant.meApiUrl, requestOptions);
        return await response.json();
    } catch (error) {
        console.error("Error fetching current user:", error);
        return { success: false, message: "Error fetching current user", error };
    }
};

const deactivateAccountApi = async () => {
    const token = localStorage.getItem("token");
    const requestOptions = {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    };

    try {
        const response = await fetch(constant.deactivateAccountUrl, requestOptions);
        return await response.json();
    } catch (error) {
        console.error("Error deactivating account:", error);
        return { success: false, message: "Error deactivating account", error };
    }
};

export {
    signupApi,
    loginApi,
    fetchUsersApi,
    sendMessageApi,
    getMessageApi,
    editProfileApi,
    changePasswordApi,
    checkCredentialsApi,
    verifyOtpApi,
    resetPasswordApi,
    getCurrentUserApi,
    deactivateAccountApi,
    getConversationsApi,
    markConversationReadApi,
    editMessageApi,
    deleteMessageApi,
    forwardMessageApi,
    reactToMessageApi,
    pinMessageApi,
    unpinMessageApi,
    starMessageApi,
    unstarMessageApi,
    getStarredMessagesApi,

};
