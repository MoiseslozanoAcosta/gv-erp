import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: number;
  username: string;
  email: string;
  nombreCompleto: string;
  direccion: string;
  telefono: string;
  fechaNacimiento: string;
  avatar?: string;
  permissions: string[];
  groupIds: number[];
}

export interface Group {
  id: number;
  nombre: string;
  descripcion: string;
  memberIds: number[];
  createdBy: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USERS_DB_KEY = 'gv_users_db';
  private readonly GROUPS_DB_KEY = 'gv_groups_db'; 
  private readonly CURRENT_USER_KEY = 'gv_current_user';
  private readonly SELECTED_GROUP_KEY = 'gv_selected_group';
  private readonly INITIALIZED_KEY = 'gv_initialized'; // ✅ Llave para control de primera carga

  private syncChannel = new BroadcastChannel('gv_auth_sync_channel');

  static readonly PERMISSIONS = [
    'group:add', 'group:edit', 'group:delete',
    'user:add', 'user:edit', 'user:delete', 'user:view',
    'ticket:add', 'ticket:edit', 'ticket:delete', 'ticket:view',
    'superAdmin'
  ];

  users = signal<User[]>(this.initializeAndLoadUsers());
  groups = signal<Group[]>(this.loadGroupsFromStorage());

  private currentUserId = signal<number | null>(this.loadCurrentUserId());
  selectedGroup = signal<Group | null>(this.loadSelectedGroup());

  currentUser = computed(() => {
    const allUsers = this.users(); 
    const id = this.currentUserId();
    if (!id) return null;
    return allUsers.find(u => u.id === id) ?? null;
  });

  constructor() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.USERS_DB_KEY && event.newValue) {
        this.users.set(JSON.parse(event.newValue));
      }
      if (event.key === this.GROUPS_DB_KEY && event.newValue) {
        this.groups.set(JSON.parse(event.newValue));
      }
    });

    this.syncChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'SYNC_USERS') {
        this.users.set(event.data.payload);
      }
    };
  }

  private loadGroupsFromStorage(): Group[] {
    const stored = localStorage.getItem(this.GROUPS_DB_KEY);
    if (stored) return JSON.parse(stored);

    const initialGroups: Group[] = [
      { id: 1, nombre: 'Equipo Dev', descripcion: 'Desarrollo backend y frontend', memberIds: [1, 2, 3], createdBy: 1 },
      { id: 2, nombre: 'Soporte', descripcion: 'Atención a clientes', memberIds: [1, 2, 4], createdBy: 2 },
      { id: 3, nombre: 'UX', descripcion: 'Diseño y experiencia de usuario', memberIds: [1, 3, 4], createdBy: 1 }
    ];
    localStorage.setItem(this.GROUPS_DB_KEY, JSON.stringify(initialGroups));
    return initialGroups;
  }

  private saveGroups(newGroups: Group[]) {
    this.groups.set([...newGroups]);
    localStorage.setItem(this.GROUPS_DB_KEY, JSON.stringify(newGroups));
  }

  private initializeAndLoadUsers(): User[] {
    const stored = localStorage.getItem(this.USERS_DB_KEY);
    const isInitialized = localStorage.getItem(this.INITIALIZED_KEY); // ✅ Verificamos si ya se inicializó antes

    const initialUsers: User[] = [
      { id: 1, username: 'superadmin', 
        email: 'superadmin@gverp.com', 
        nombreCompleto: 'Super Administrador', 
        direccion: 'Santiago de Querétaro, México', 
        telefono: '4421234567', 
        fechaNacimiento: '1990-01-01',
        permissions: [...AuthService.PERMISSIONS], 
        groupIds: [1, 2, 3] },
      { id: 2, username: 'admin@gmail.com', 
        email: 'admin@gmail.com', 
        nombreCompleto: 'Moises Lozano Acosta', 
        direccion: 'Santiago de Querétaro, México',
        telefono: '4421234567', fechaNacimiento: '1990-05-15', 
        permissions: ['group:add', 'group:edit', 'group:delete', 'ticket:add', 'ticket:edit', 'ticket:view', 'user:view'], 
        groupIds: [1, 2] },
      { id: 3, 
        username: 'jorge@gmail.com', 
        email: 'jorge@gmail.com', 
        nombreCompleto: 'Jorge Torres', 
        direccion: 'CDMX', 
        telefono: '5551234567', 
        fechaNacimiento: '1995-03-20', 
        permissions: ['ticket:view','ticket:add'], 
        groupIds: [1, 3] },
      { id: 4, 
        username: 'ana@gmail.com', 
        email: 'ana@gmail.com', 
        nombreCompleto: 'Ana García', 
        direccion: 'Guadalajara', 
        telefono: '3331234567', 
        fechaNacimiento: '1993-07-10', 
        permissions: [ 'ticket:edit', 'ticket:view'], 
        groupIds: [2, 3] }
    ];

    // ✅ Si no hay nada guardado Y es la primera vez que corre la app:
    if (!stored && !isInitialized) {
      localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(initialUsers));
      localStorage.setItem(this.INITIALIZED_KEY, 'true'); // Marcamos como inicializado
      return initialUsers;
    }

    // ✅ Si ya existe información o ya fue inicializado, respetamos el Storage (aunque esté vacío)
    let usersFromStorage: User[] = stored ? JSON.parse(stored) : [];
    let needsUpdate = false;

    usersFromStorage = usersFromStorage.map(storedUser => {
      const codeUser = initialUsers.find(u => u.id === storedUser.id);
      if (codeUser && JSON.stringify(codeUser.permissions) !== JSON.stringify(storedUser.permissions)) {
        needsUpdate = true;
        return { ...storedUser, permissions: codeUser.permissions };
      }
      return storedUser;
    });

    if (needsUpdate) localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(usersFromStorage));
    return usersFromStorage;
  }

  private loadCurrentUserId(): number | null {
    const stored = sessionStorage.getItem(this.CURRENT_USER_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return typeof parsed === 'number' ? parsed : parsed?.id ?? null;
    } catch { return null; }
  }

  private loadSelectedGroup(): Group | null {
    const stored = sessionStorage.getItem(this.SELECTED_GROUP_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  login(email: string, password: string): boolean {
    const user = this.users().find(u => u.email === email || u.username === email);
    if (!user) return false;
    this.currentUserId.set(user.id);
    sessionStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user.id));
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(this.CURRENT_USER_KEY);
    sessionStorage.removeItem(this.SELECTED_GROUP_KEY);
    this.currentUserId.set(null);
    this.selectedGroup.set(null);
  }

  selectGroup(group: Group): void {
    sessionStorage.setItem(this.SELECTED_GROUP_KEY, JSON.stringify(group));
    this.selectedGroup.set(group);
  }

  getGroupsForUser(userId: number): Group[] {
    return this.groups().filter(g => g.memberIds.includes(userId));
  }

  getUserById(id: number): User | undefined {
    return this.users().find(u => u.id === id);
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return user.permissions.includes('superAdmin') || user.permissions.includes(permission);
  }

  isSuperAdmin(): boolean {
    return this.currentUser()?.permissions.includes('superAdmin') ?? false;
  }

  register(data: any): boolean {
    if (this.users().find(u => u.email === data.email)) return false;
    const newUser: User = {
      id: Math.max(...this.users().map(u => u.id), 0) + 1,
      username: data.username || data.email!,
      email: data.email!,
      nombreCompleto: data.nombreCompleto || '',
      direccion: data.direccion || '',
      telefono: data.telefono || '',
      fechaNacimiento: data.fechaNacimiento || '',
      permissions: [],
      groupIds: []
    };
    this.users.update(list => {
      const newList = [...list, newUser];
      localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(newList));
      this.syncChannel.postMessage({ type: 'SYNC_USERS', payload: newList });
      return newList;
    });
    return true;
  }

  updateUser(updated: User): void {
    this.users.update(list => {
      const newList = list.map(u => u.id === updated.id ? { ...updated } : u);
      localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(newList));
      this.syncChannel.postMessage({ type: 'SYNC_USERS', payload: newList });
      return [...newList]; 
    });
    if (this.currentUserId() === updated.id) {
       const currentId = updated.id;
       this.currentUserId.set(null);
       setTimeout(() => this.currentUserId.set(currentId), 0);
    }
  }

  updateGroup(updated: Group): void {
    const currentGroups = this.groups();
    const newList = currentGroups.map(g => g.id === updated.id ? { ...updated } : g);
    this.saveGroups(newList);
  }

  addPermissionToUser(userId: number, permission: string): void {
    const user = this.users().find(u => u.id === userId);
    if (!user || user.permissions.includes(permission)) return;
    this.updateUser({ ...user, permissions: [...user.permissions, permission] });
  }

  removePermissionFromUser(userId: number, permission: string): void {
    const user = this.users().find(u => u.id === userId);
    if (!user) return;
    this.updateUser({ ...user, permissions: user.permissions.filter(p => p !== permission) });
  }

  getUsersInGroup(groupId: number): User[] {
    const group = this.groups().find(g => g.id === groupId);
    if (!group) return [];
    return this.users().filter(u => group.memberIds.includes(u.id));
  }

  addUserToGroup(userId: number, groupId: number): void {
    const group = this.groups().find(g => g.id === groupId);
    const user = this.users().find(u => u.id === userId);
    if (!group || !user) return;

    if (!group.memberIds.includes(userId)) {
      this.updateGroup({ ...group, memberIds: [...group.memberIds, userId] });
    }
    if (!user.groupIds.includes(groupId)) {
      this.updateUser({ ...user, groupIds: [...user.groupIds, groupId] });
    }
  }

  removeUserFromGroup(userId: number, groupId: number): void {
    const group = this.groups().find(g => g.id === groupId);
    const user = this.users().find(u => u.id === userId);
    if (!group || !user) return;

    this.updateGroup({ ...group, memberIds: group.memberIds.filter(id => id !== userId) });
    this.updateUser({ ...user, groupIds: user.groupIds.filter(id => id !== groupId) });
  }

  deleteUser(userId: number): void {
    this.users.update(list => {
      const newList = list.filter(u => u.id !== userId);
      localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(newList));
      this.syncChannel.postMessage({ type: 'SYNC_USERS', payload: newList });
      return newList;
    });
  }
}