import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, SidebarComponent],
  template: `
    <div style="display:flex; min-height:100vh;">
      <app-sidebar></app-sidebar>
      <main style="flex:1; background:#0f172a; min-height:100vh; overflow-y:auto;">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class MainLayoutComponent {}