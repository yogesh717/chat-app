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


const sendMessageApi = async (receiverId, newMessage) => {

    const token = localStorage.getItem("token");

    const url = constant.sendMessageUrl.replace(":id", receiverId);

    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
    };

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

};
