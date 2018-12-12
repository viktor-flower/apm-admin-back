import { EAdminPermission, ESystemRole } from './declaration'

export const data = {
  permisions: [
    { _id: undefined, name: EAdminPermission.LOGIN, title: 'Login Access', system: true },
    { _id: undefined, name: EAdminPermission.ADMIN_SERVICE_ACCESS, title: 'Administer Service Access', system: true },
    { _id: undefined, name: EAdminPermission.MANAGE_PERMISSIONS, title: 'Manage Permissions', system: true },
    { _id: undefined, name: EAdminPermission.MANAGE_ROLES, title: 'Manage Roles', system: true },
    { _id: undefined, name: EAdminPermission.MANAGE_USERS, title: 'Manage Users', system: true },
    { _id: undefined, name: EAdminPermission.FETCH_OWN_ACL, title: 'Fetch own ACL', system: true },
    { _id: undefined, name: EAdminPermission.FETCH_ANY_ACL, title: 'Fetch any ACL', system: true }
  ],
  roles: [
    {
      _id: undefined,
      name: ESystemRole.ANONYMOUSE,
      title: 'Anonymouse',
      system: true,
      permissionNames: [EAdminPermission.LOGIN]
    },
    {
      _id: undefined,
      name: ESystemRole.AUTHENTICATED,
      title: 'Authenticated',
      system: true,
      permissionNames: [
        EAdminPermission.LOGIN,
        EAdminPermission.FETCH_OWN_ACL
      ]
    },
    {
      _id: undefined,
      name: ESystemRole.ADMINISTER,
      title: 'Administer',
      system: true,
      permissionNames: [
        EAdminPermission.LOGIN,
        EAdminPermission.ADMIN_SERVICE_ACCESS,
        EAdminPermission.MANAGE_ROLES,
        EAdminPermission.MANAGE_PERMISSIONS,
        EAdminPermission.MANAGE_USERS,
        EAdminPermission.FETCH_OWN_ACL,
        EAdminPermission.FETCH_ANY_ACL
      ]
    },
    {
      _id: undefined,
      name: 'client',
      title: 'Client',
      system: true,
      permissionNames: [
        EAdminPermission.LOGIN,
        EAdminPermission.FETCH_OWN_ACL,
        EAdminPermission.FETCH_ANY_ACL
      ]
    }
  ],
  users: [
    { _id: undefined, name: 'client', password: 'client', roleNames: [ 'client'] },
    { _id: undefined, name: 'administer', password: 'administer', roleNames: [ESystemRole.ADMINISTER] }
  ]
}
