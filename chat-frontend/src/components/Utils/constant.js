const serverURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const apiURL = serverURL;

const constant = {
    serverURL: serverURL,
    apiURL: apiURL,

    signupApiUrl: apiURL + '/users/signup',
    loginApiUrl: apiURL + '/users/login',
    fetchAllUrl: apiURL + '/users',
    meApiUrl: apiURL + '/users/me',
    deactivateAccountUrl: apiURL + '/users/deactivate',
    sendMessageUrl: apiURL + '/messages/send/:id',
    getMessageUrl: apiURL + '/messages/get/:id',
    conversationsUrl: apiURL + '/messages/conversations',
    markReadUrl: apiURL + '/messages/mark-read/:id',
    editMessageUrl: apiURL + '/messages/edit/:id',
    deleteMessageUrl: apiURL + '/messages/delete/:id',
    forwardMessageUrl: apiURL + '/messages/forward/:id',
    reactMessageUrl: apiURL + '/messages/react/:id',
    pinMessageUrl: apiURL + '/messages/pin/:id',
    unpinMessageUrl: apiURL + '/messages/unpin/:id',
    starMessageUrl: apiURL + '/messages/star/:id',
    unstarMessageUrl: apiURL + '/messages/unstar/:id',
    starredMessagesUrl: apiURL + '/messages/starred',
    editProfileApiUrl: apiURL + '/users/update-profile/:id',
    changePasswordUrl: apiURL + '/users/change-password/:id',
    checkCredentialsApiUrl: apiURL + '/users/check-credentials',
    verifyOtpApiUrl: apiURL + '/users/verify-otp',
    resetPasswordApiUrl: apiURL + '/users/reset-password'
};

export default constant;
