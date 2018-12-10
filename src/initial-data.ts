export const data = {
  permisions: [
    { _id: undefined, name: 'login_access', title: 'Login Access', system: true },
    { _id: undefined, name: 'administer_service_access', title: 'Administer Service Access', system: true },
    { _id: undefined, name: 'manage_permissions', title: 'Manage Permissions', system: true },
    { _id: undefined, name: 'manage_roles', title: 'Manage Roles', system: true },
    { _id: undefined, name: 'manage_users', title: 'Manage Users', system: true },
    { _id: undefined, name: 'fetch_any_user', title: 'Fetch any user', system: true },
    { _id: undefined, name: 'fetch_own_acl', title: 'Fetch own ACL', system: true },
    { _id: undefined, name: 'fetch_any_acl', title: 'Fetch any ACL', system: true }
  ],
  roles: [
    {
      _id: undefined,
      name: 'anonymouse',
      title: 'Anonymouse',
      system: true,
      permissionNames: ['login_access']
    },
    {
      _id: undefined,
      name: 'authneticated',
      title: 'Authenticated',
      system: true,
      permissionNames: [
        'login_access',
        'fetch_own_acl'
      ]
    },
    {
      _id: undefined,
      name: 'administer',
      title: 'Administer',
      system: true,
      permissionNames: [
        'login_access',
        'administer_service_access',
        'manage_permissions',
        'manage_roles',
        'fetch_own_acl',
        'fetch_any_acl'
      ]
    },
    {
      _id: undefined,
      name: 'client',
      title: 'Client',
      system: true,
      permissionNames: [
        'login_access',
        'fetch_any_user',
        'fetch_own_acl',
        'fetch_any_acl'
      ]
    }
  ],
  users: [
    { _id: undefined, name: 'client', password: 'client', roleNames: ['client'] },
    { _id: undefined, name: 'administer', password: 'administer', roleNames: ['administer'] }
  ]
}
