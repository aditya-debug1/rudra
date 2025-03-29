import styles from "@/scss/layout/SettingsLayout.module.scss";
import { RoleType, useRoleStore, useRoles } from "@/store/role";
import { useEffect, useState } from "react";
import { EmptyRoleSettings, RoleSettings } from "./role-settings";
import { RoleSortable } from "./role-sortable";
import { useAuth } from "@/store/auth";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { hasPermission } from "@/hooks/use-role";
import { CenterWrapper } from "@/components/custom ui/center-page";
import ErrorCard, { AccessDenied } from "@/components/custom ui/error-display";
import { CustomAxiosError } from "@/utils/types/axios";
import { RoleSkeleton } from "./role-skeleton";

export default function Role() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { selectedRole, setSelectedRole } = useRoleStore();
  const {
    rolesQuery,
    deleteRoleMutation,
    updateRoleMutation,
    updatePrecedencesMutation,
  } = useRoles();

  const { combinedRole, logout: handleLogout } = useAuth(false);
  const showRoles =
    hasPermission(combinedRole, "Settings", "view-role") ||
    hasPermission(combinedRole, "Settings", "update-role");

  const [roles, setRoles] = useState(rolesQuery.data || []);
  const currentRole = roles.find(
    (role) => role.name === combinedRole?.highestRole,
  );

  // Set initial selected role in useEffect
  useEffect(() => {
    if (!selectedRole && currentRole) {
      setSelectedRole(currentRole);
    }
  }, [currentRole, selectedRole, setSelectedRole]);

  useEffect(() => {
    if (rolesQuery.data) {
      setRoles(rolesQuery.data);
    }
  }, [rolesQuery]);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Settings", to: "/panel/settings" },
      { label: "Roles" },
    ]);
  }, [setBreadcrumbs]);

  // Handle loading and error states
  if (rolesQuery.isLoading) {
    return <RoleSkeleton />;
  }

  if (rolesQuery.error) {
    const { response, message } = rolesQuery.error as CustomAxiosError;
    let errMsg = response?.data.error ?? message;

    if (errMsg === "Access denied. No token provided")
      errMsg = "Access denied. No token provided please login again";

    if (errMsg === "Network Error")
      errMsg =
        "Connection issue detected. Please check your internet or try again later.";

    return (
      <CenterWrapper className="px-2 gap-2 text-center">
        <ErrorCard
          title="Error occured"
          description={errMsg}
          btnTitle="Go to Login"
          onAction={handleLogout}
        />
      </CenterWrapper>
    );
  }

  if (!showRoles)
    return (
      <CenterWrapper>
        <AccessDenied />
      </CenterWrapper>
    );

  // Handlers
  const handleSetRole = (updatedRole: RoleType) => {
    setSelectedRole(updatedRole);
    updateRoleMutation.mutate({
      id: updatedRole._id,
      name: updatedRole.name,
      permissions: updatedRole.permissions,
      updatedBy: updatedRole.updatedBy,
    });
  };

  const handleDelete = (roleId: string) => {
    deleteRoleMutation.mutate(roleId);
    // If the deleted role was selected, clear the selection
    if (selectedRole?._id === roleId) {
      setSelectedRole(null);
    }
  };

  const onPrecedenceChange = (updatedRoles: RoleType[]) => {
    const updates = updatedRoles.map((role) => ({
      _id: role._id,
      precedence: role.precedence,
    }));
    updatePrecedencesMutation.mutate(updates);
  };

  const handleView = (role: RoleType) => {
    setSelectedRole(role);
  };

  return (
    <div
      className={`flex items-start gap-4 flex-col md:flex-row w-full overflow-hidden ${styles.SettingsLayout}`}
    >
      <RoleSortable
        roles={roles}
        currentRole={currentRole!}
        onDelete={handleDelete}
        onView={handleView}
        onRolesChange={onPrecedenceChange}
      />

      {!roles.length ? (
        <EmptyRoleSettings showCreateRole>
          No roles available. Add some to get started.
        </EmptyRoleSettings>
      ) : !selectedRole ? (
        <EmptyRoleSettings>
          No role selected. Please select a role to view or edit permissions.
        </EmptyRoleSettings>
      ) : (
        <RoleSettings role={selectedRole} setRole={handleSetRole} />
      )}
    </div>
  );
}
