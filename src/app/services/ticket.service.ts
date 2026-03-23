import { Injectable } from '@angular/core';

export type TicketStatus = 'pendiente' | 'en-progreso' | 'revision' | 'hecho' | 'bloqueado';
export type TicketPriority = '极高' | '高' | '中高' | '中' | '中低' | '低' | '极低';

export interface TicketComment {
  id: number;
  userId: number;
  userName: string;
  text: string;
  createdAt: Date;
}

export interface TicketHistory {
  id: number;
  userId: number;
  userName: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: Date;
}

export interface Ticket {
  id: number;
  groupId: number;
  title: string;
  description: string;
  status: TicketStatus;
  assignedTo: number | null;
  priority: TicketPriority;
  createdBy: number;
  createdAt: Date;
  dueDate: Date | null;
  comments: TicketComment[];
  history: TicketHistory[];
}

export const PRIORITY_LABELS: Record<TicketPriority, { label: string; color: string }> = {
  '极高': { label: '极高 (Crítica)', color: '#dc2626' },
  '高':   { label: '高 (Alta)',      color: '#ea580c' },
  '中高': { label: '中高 (Media-Alta)', color: '#d97706' },
  '中':   { label: '中 (Media)',     color: '#ca8a04' },
  '中低': { label: '中低 (Media-Baja)', color: '#65a30d' },
  '低':   { label: '低 (Baja)',      color: '#16a34a' },
  '极低': { label: '极低 (Mínima)',  color: '#0891b2' },
};

export const STATUS_LABELS: Record<TicketStatus, { label: string; color: string; icon: string }> = {
  'pendiente':   { label: 'Pendiente',   color: '#6b7280', icon: 'pi-clock' },
  'en-progreso': { label: 'En Progreso', color: '#3b82f6', icon: 'pi-spin pi-spinner' },
  'revision':    { label: 'Revisión',    color: '#8b5cf6', icon: 'pi-eye' },
  'hecho':       { label: 'Hecho',       color: '#10b981', icon: 'pi-check-circle' },
  'bloqueado':   { label: 'Bloqueado',   color: '#ef4444', icon: 'pi-ban' },
};

@Injectable({ providedIn: 'root' })
export class TicketService {
  tickets: Ticket[] = [
    {
      id: 1, groupId: 1, title: 'Implementar autenticación JWT',
      description: 'Crear sistema de login con tokens JWT y refresh tokens.',
      status: 'en-progreso', assignedTo: 2, priority: '高', createdBy: 2,
      createdAt: new Date('2025-01-10'), dueDate: new Date('2025-02-01'),
      comments: [{ id: 1, userId: 3, userName: 'Jorge Torres', text: 'Ya tengo el middleware listo', createdAt: new Date('2025-01-12') }],
      history: [{ id: 1, userId: 2, userName: 'Moises Lozano', field: 'status', oldValue: 'pendiente', newValue: 'en-progreso', changedAt: new Date('2025-01-11') }]
    },
    {
      id: 2, groupId: 1, title: 'Diseñar base de datos',
      description: 'Modelar entidades principales del ERP.',
      status: 'hecho', assignedTo: 3, priority: '极高', createdBy: 2,
      createdAt: new Date('2025-01-05'), dueDate: new Date('2025-01-20'),
      comments: [], history: []
    },
    {
      id: 3, groupId: 1, title: 'Crear módulo de reportes',
      description: 'Dashboard con gráficas de ventas e inventario.',
      status: 'pendiente', assignedTo: null, priority: '中', createdBy: 2,
      createdAt: new Date('2025-01-15'), dueDate: new Date('2025-02-15'),
      comments: [], history: []
    },
    {
      id: 4, groupId: 1, title: 'Fix bug en paginación',
      description: 'La tabla de usuarios no pagina correctamente después de filtrar.',
      status: 'bloqueado', assignedTo: 2, priority: '中高', createdBy: 3,
      createdAt: new Date('2025-01-18'), dueDate: new Date('2025-01-25'),
      comments: [], history: []
    },
    {
      id: 5, groupId: 2, title: 'Responder tickets de soporte pendientes',
      description: 'Hay 15 tickets sin respuesta de la semana pasada.',
      status: 'pendiente', assignedTo: 4, priority: '高', createdBy: 2,
      createdAt: new Date('2025-01-14'), dueDate: new Date('2025-01-22'),
      comments: [], history: []
    },
    {
      id: 6, groupId: 2, title: 'Actualizar FAQ del portal',
      description: 'Añadir preguntas frecuentes sobre el nuevo módulo.',
      status: 'revision', assignedTo: 2, priority: '低', createdBy: 4,
      createdAt: new Date('2025-01-16'), dueDate: new Date('2025-01-30'),
      comments: [], history: []
    },
    {
      id: 7, groupId: 3, title: 'Rediseñar flujo de onboarding',
      description: 'El flujo actual tiene muchos pasos, simplificarlo a 3.',
      status: 'en-progreso', assignedTo: 4, priority: '中高', createdBy: 3,
      createdAt: new Date('2025-01-12'), dueDate: new Date('2025-02-10'),
      comments: [], history: []
    },
    {
      id: 8, groupId: 3, title: 'Crear sistema de design tokens',
      description: 'Definir variables de color, tipografía y espaciado.',
      status: 'pendiente', assignedTo: null, priority: '中', createdBy: 4,
      createdAt: new Date('2025-01-17'), dueDate: null,
      comments: [], history: []
    }
  ];

  getByGroup(groupId: number): Ticket[] {
    return this.tickets.filter(t => t.groupId === groupId);
  }

  getById(id: number): Ticket | undefined {
    return this.tickets.find(t => t.id === id);
  }

  getByUser(userId: number): Ticket[] {
    return this.tickets.filter(t => t.assignedTo === userId);
  }

  create(ticket: Omit<Ticket, 'id' | 'comments' | 'history'>): Ticket {
    const newTicket: Ticket = {
      ...ticket,
      id: Math.max(...this.tickets.map(t => t.id), 0) + 1,
      comments: [],
      history: []
    };
    this.tickets.push(newTicket);
    return newTicket;
  }

  update(id: number, changes: Partial<Ticket>, userId: number, userName: string): void {
    const ticket = this.tickets.find(t => t.id === id);
    if (!ticket) return;
    for (const key of Object.keys(changes) as (keyof Ticket)[]) {
      if (key === 'comments' || key === 'history') continue;
      const oldVal = String(ticket[key] ?? '');
      const newVal = String((changes as any)[key] ?? '');
      if (oldVal !== newVal) {
        ticket.history.push({
          id: ticket.history.length + 1,
          userId, userName,
          field: key,
          oldValue: oldVal,
          newValue: newVal,
          changedAt: new Date()
        });
      }
      (ticket as any)[key] = (changes as any)[key];
    }
  }

  addComment(ticketId: number, userId: number, userName: string, text: string): void {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    ticket.comments.push({
      id: ticket.comments.length + 1,
      userId, userName, text,
      createdAt: new Date()
    });
  }

  delete(id: number): void {
    this.tickets = this.tickets.filter(t => t.id !== id);
  }

  getStats(groupId: number) {
    const group = this.getByGroup(groupId);
    return {
      total: group.length,
      pendiente: group.filter(t => t.status === 'pendiente').length,
      'en-progreso': group.filter(t => t.status === 'en-progreso').length,
      revision: group.filter(t => t.status === 'revision').length,
      hecho: group.filter(t => t.status === 'hecho').length,
      bloqueado: group.filter(t => t.status === 'bloqueado').length,
    };
  }
}
