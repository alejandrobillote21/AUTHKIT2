import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";

const UserContext = React.createContext();

// Set axios to include credentials with every request
axios.defaults.withCredentials = true;

export const UserContextProvider = ({ children }) => {
    const serverUrl = "http://localhost:8000";

    const router = useRouter();

    const [user, setUser] = useState({});
    const [allUsers, setAllUsers] = useState([]);
    const [userState, setUserState] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    // Register User
    const registerUser = async (e) => {
        e.preventDefault();
        if(
            !userState.email.includes("@") || 
            !userState.password || userState.password.length <6
        ) {
            toast.error("Please enter a valid email and password (min 6 characters)!");
            return;
        }

        try {
            const res = await axios.post(`${serverUrl}/api/v1/register`, userState);

            toast.success("User registered successfully!");

            // Clear the form
            setUserState({
                name: "",
                email: "",
                password: "",
            });

            // Redirect to login page
            router.push("/login");
        } catch (error) {
            console.log("Error registering user!", error);
            toast.error(error.response.data.message);
        }
    };

    // Login the User
    const loginUser = async (e) => {
        e.preventDefault();
        try {
          const res = await axios.post(
            `${serverUrl}/api/v1/login`,
            {
              email: userState.email,
              password: userState.password,
            },
            {
              withCredentials: true, // send cookies to the server
            }
          );

        toast.success("User logged in successfully!");

        // Clear the form
        setUserState({
            email: "",
            password: "",
        });

      // refresh the user details
      await getUser(); // fetch before redirecting

            // Push User to the Dashboard page
            router.push("/");
    } catch (error) {
      console.log("Error logging in user", error);
      toast.error(error.response.data.message);
    }
  };

    // Get User logged in status
    const userLoginStatus = async () => {
        let loggedIn = false;
        try {
          const res = await axios.get(`${serverUrl}/api/v1/login-status`, {
            withCredentials: true, // Send cookies to the server
          });
    
          // Coerce the string to boolean
          loggedIn = !!res.data;
          setLoading(false);
    
          if (!loggedIn) {
            router.push("/login");
          }
        } catch (error) {
          console.log("Error getting user login status", error);
        }

        console.log("User logged in status", loggedIn);
    
        return loggedIn;
      };

      // Logout User
      const logoutUser = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/v1/logout`, {
                withCredentials: true, // Send Cookies to the server
            });

            toast.success("User logged out successfully!");

            // Redirect to Login page
            router.push("/login");
        } catch (error) {
            console.log("Error logging out user!", error);
            toast.error(error.response.data.message);
        }
      }

      // Get User details
    const getUser = async () => {
        setLoading(true);
        try {
        const res = await axios.get(`${serverUrl}/api/v1/user`, {
            withCredentials: true, // send cookies to the server
        });

        setUser((prevState) => {
            return {
            ...prevState,
            ...res.data,
            };
        });

        setLoading(false);
        } catch (error) {
        console.log("Error getting user details", error);
        setLoading(false);
        toast.error(error.response.data.message);
        }
    };

    // Update User details
    const updateUser = async (e, data) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.patch(`${serverUrl}/api/v1/user`, data, {
                withCredentials: true, // Send Cookies to the server
            });

            // Update the User state
            setUser((prevState) => {
                return {
                    ...prevState,
                    ...res.data,
                };
            });

            toast.success("User updated successfully!");

            setLoading(false);
        } catch (error) {
            console.log("Error updating user details!", error);
            setLoading(false);
            toast.error(error.response.data.message);
        }
    };

    // Email verification
  const emailVerification = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/verify-email`,
        {},
        {
          withCredentials: true, // Send Cookies to the server
        }
      );

      toast.success("Email verification sent successfully!");
      setLoading(false);
    } catch (error) {
      console.log("Error sending email verification!", error);
      setLoading(false);
      toast.error(error.response.data.message);
    }
  };

  // Verify User/Email
  const verifyUser = async (token) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/verify-user/${token}`,
        {},
        {
          withCredentials: true, // Send Cookies to the server
        }
      );

      toast.success("User verified successfully");

      // Refresh the User details
      getUser();

      setLoading(false);
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.log("Error verifying user", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  // Forgot password Email
  const forgotPasswordEmail = async (email) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/forgot-password`,
        {
          email,
        },
        {
          withCredentials: true, // Send Cookies to the server
        }
      );

      toast.success("Forgot password email sent successfully!");
      setLoading(false);
    } catch (error) {
      console.log("Error sending forgot password email!", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/reset-password/${token}`,
        {
          password,
        },
        {
          withCredentials: true, // send cookies to the server
        }
      );

      toast.success("Password reset successfully");
      setLoading(false);
      // redirect to login page
      router.push("/login");
    } catch (error) {
      console.log("Error resetting password", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  // change password
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);

    try {
      const res = await axios.patch(
        `${serverUrl}/api/v1/change-password`,
        { currentPassword, newPassword },
        {
          withCredentials: true, // send cookies to the server
        }
      );

      toast.success("Password changed successfully!");
      setLoading(false);
    } catch (error) {
      console.log("Error changing password!", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

    // Dynamic form handler
    const handlerUserInput = (name) => (e) => {
        const value = e.target.value;

        setUserState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    useEffect(() => {
        const loginStatusGetUser = async () => {
          const isLoggedIn = await userLoginStatus();
    
          if (isLoggedIn) {
            await getUser();
          }
        };
    
        loginStatusGetUser();
      }, []);

    return (
        <UserContext.Provider 
            value={{
                registerUser,
                userState,
                handlerUserInput,
                loginUser,
                userLoginStatus,
                logoutUser,
                user,
                updateUser,
                emailVerification,
                verifyUser,
                forgotPasswordEmail,
                resetPassword,
                changePassword,

        }}
    >
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    return useContext(UserContext);
};