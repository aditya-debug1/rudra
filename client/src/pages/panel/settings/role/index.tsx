import styles from "@/scss/layout/SettingsLayout.module.scss";
import { RoleType, useRoleStore, useRoles } from "@/store/role";
import { useEffect, useState } from "react";
import { EmptyRoleSettings, RoleSettings } from "./role-settings";
import { RoleSortable } from "./role-sortable";
import { useAuth } from "@/store/auth";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { hasPermission } from "@/hooks/use-role";
import { CenterWrapper } from "@/components/custom ui/center-page";
import { AccessDenied } from "@/components/custom ui/error-display";

export default function Role() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { selectedRole, setSelectedRole } = useRoleStore();
  const {
    rolesQuery,
    deleteRoleMutation,
    updateRoleMutation,
    updatePrecedencesMutation,
  } = useRoles();

  const { combinedRole } = useAuth(false);
  const showRoles =
    hasPermission(combinedRole, "Settings", "read-role") ||
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
    return <div>Loading...</div>;
  }

  if (rolesQuery.isError) {
    return <div>Error loading roles</div>;
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
