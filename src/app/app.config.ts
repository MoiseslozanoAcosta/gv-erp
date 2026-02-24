import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'; //
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Esto resuelve el error NG0908 de tus imágenes anteriores
    provideZoneChangeDetection({ eventCoalescing: true }), //
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: false
            }
        }
    })
  ]
};
