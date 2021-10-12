import React, { FC } from 'react';
import { SelectableValue } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Role } from 'app/types';
import { RolePicker } from './RolePicker';

export interface Props {
  builtinRole: string;
  userId: number;
  orgId?: number;
  onBuiltinRoleChange: (newRole: string) => void;
}

export const UserRolePicker: FC<Props> = ({ builtinRole, userId, orgId, onBuiltinRoleChange }) => {
  const getRoles = async () => {
    const roles = await getUserRoles(userId, orgId);
    return roles.map((role) => role.uid);
  };

  return (
    <RolePicker
      builtinRole={builtinRole}
      onRolesChange={(roles) => updateUserRoles(roles, userId, orgId)}
      onBuiltinRoleChange={onBuiltinRoleChange}
      getRoleOptions={getRolesOptions}
      getRoles={getRoles}
    />
  );
};

export const getRolesOptions = async (query?: string): Promise<Array<SelectableValue<string>>> => {
  const roles = await getBackendSrv().get('/api/access-control/roles');
  if (!roles || !roles.length) {
    return [];
  }
  return roles.map(
    (role: Role): SelectableValue => ({
      value: role.uid,
      label: role.name,
      description: role.description,
    })
  );
};

export const getUserRoles = async (userId: number, orgId?: number): Promise<Role[]> => {
  const roles = await getBackendSrv().get(`/api/access-control/users/${userId}/roles`);
  if (!roles || !roles.length) {
    return [];
  }
  return roles;
};

export const updateUserRoles = (rolesUIDs: string[], userId: number, orgId?: number) => {
  return getBackendSrv().put(`/api/access-control/users/${userId}/roles`, {
    orgId: orgId,
    rolesUids: rolesUIDs,
  });
};
