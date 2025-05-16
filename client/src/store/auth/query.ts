import { toast } from "@/hooks/use-toast";
import { roleApi } from "@/store/role";
import { userType } from "@/store/users";
import newRequest from "@/utils/func/request";
import { CustomAxiosError } from "@/utils/types/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./store";
import { LoginData } from "./types";

export const useAuth = (enabled = false) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setCombinedRole } = useAuthStore();

  const login = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Cancel any ongoing heartbeat queries before login
      queryClient.cancelQueries({ queryKey: ["heartbeat"] });
      // Remove any stale session data
      queryClient.removeQueries({ queryKey: ["heartbeat"] });

      const response = await newRequest.post("/auth/login", credentials);
      return response.data.data as userType;
    },
    onSuccess: async (userData) => {
      // Setting current user
      setUser(userData);

      if (userData.settings?.isPassChange) {
        navigate(`/auth/change-password/${userData._id}`);
      } else if (!userData.settings?.isRegistered) {
        navigate(`/auth/register-user/${userData._id}`);
      } else {
        navigate("/panel/");
        // Fetch combined role after user data
        const combinedRole = await roleApi.getCombinedRole(userData.roles);
        // Setting current user's combined role
        setCombinedRole(combinedRole);
      }

      // Invalidate and refetch after login is successful
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["heartbeat"] });
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      setUser(null);
      await newRequest.post("/auth/logout");
      navigate("/auth/login");
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["current-user"] });
      queryClient.removeQueries({ queryKey: ["heartbeat"] });
    },
    onError: () => {
      navigate("/auth/login");
    },
  });

  const heartbeat = useQuery({
    queryKey: ["heartbeat"],
    queryFn: async () => {
      const response = await newRequest.get("/auth/heartbeat");
      return response;
    },
    enabled,
    retry: false,
    refetchInterval: 15_000,
    gcTime: Infinity,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  const {
    data: currentUser,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const response = await newRequest.post("/auth/current-user");
        const userData = response.data.data;
        // Fetch combined role after user data
        const combinedRole = await roleApi.getCombinedRole(userData.roles);
        // Setting current user and combined role
        setUser(userData);
        setCombinedRole(combinedRole);
        return userData;
      } catch (error) {
        const Err = error as CustomAxiosError;
        toast({
          title: "Error occurred!",
          description: Err.response?.data.error,
          variant: "destructive",
        });
        throw error; // Rethrow to trigger error handling
      }
    },
    enabled,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
    heartbeat,
    user: currentUser,
    isLoading,
    login: login.mutate,
    logout: logout.mutate,
    checkUser: refetch,
    isLoggingIn: login.isPending,
    loginError: login.error as CustomAxiosError | null,
    combinedRole: useAuthStore((state) => state.combinedRole), // Expose combinedRole
  };
};
