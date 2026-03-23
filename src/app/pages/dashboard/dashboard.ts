import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ Crucial
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class DashboardComponent {
    selectedGroup = computed(() => this.auth.selectedGroup());

  
    canCreate = computed(() => 
        this.auth.hasPermission('ticket:add') || this.auth.isSuperAdmin()
    );

    constructor(public auth: AuthService) { }
}