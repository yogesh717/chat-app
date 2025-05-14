const serverURL = "http://localhost:5000"; 
const apiURL = serverURL; 

const constant = { 
    serverURL: serverURL,
    apiURL: apiURL,

    signupApiUrl: apiURL + '/users/signup',
    loginApiUrl: apiURL + '/users/login',
    fetchAllUrl: apiURL + '/users',
    sendMessageUrl: apiURL + '/messages/send/:id',
    getMessageUrl: apiURL + '/messages/get/:id',
    editProfileApiUrl: apiURL + '/users/update-profile/:id',
    changePasswordUrl: apiURL + '/users/change-password/:id',
    checkCredentialsApiUrl: apiURL + '/users/check-credentials',
    verifyOtpApiUrl: apiURL + '/users/verify-otp',  
    resetPasswordApiUrl: apiURL + '/users/reset-password' 
};

export default constant;
