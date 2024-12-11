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
    const [loading, setLoading] = useState(true);

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

            toast.success("User registered successfully");

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

      // get user details
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
                
        }}
    >
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    return useContext(UserContext);
};