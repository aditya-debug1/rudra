import { userType } from "@/store/users";
import newRequest from "@/utils/func/request";
import { CustomAxiosError } from "@/utils/types/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { roleApi } from "@/store/role";
import { LoginData } from "./types";
import { useAuthStore } from "./store";
import { toast } from "@/hooks/use-toast";

export const useAuth = (enabled = false) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setCombinedRole } = useAuthStore();

  const login = useMutation({
    mutationFn: async (credentials: LoginData) => {
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
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
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
    },
    onError: () => {
      navigate("/auth/login");
    },
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
      }
    },
    enabled,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
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
