import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // Fix: Should be AppComponent, not App

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
