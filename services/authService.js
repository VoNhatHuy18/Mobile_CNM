import httpRequest from "../config/http";

const authService = {
    login: async (email, password) => {
        const result = await httpRequest.post("/auth/login", {
            email,
            password,
        });

        return result;
    },
    register: async (username, email, password) => {
        const result = await httpRequest.post("/auth/register", {
            username,
            email,
            password,
        });

        return result;
    },
    forgotPassword: async (email) => {
        const result = await httpRequest.post("/auth/forgotPassword", {
            email,
        });

        return result;
    },
    resetPassword: async (userId, password) => {
        const result = await httpRequest.post("/auth/resetPassword", {
            userId,
            newPassword: password,
        });

        return result;
    },
    verifyOtp: async (userId, otp) => {
        const result = await httpRequest.post("/auth/otpVerify", {
            userId,
            otp,
        });

        return result;
    },
};

export default authService;
