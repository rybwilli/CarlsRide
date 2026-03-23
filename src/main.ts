import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

import { AppModule } from './app/app.module';

Amplify.configure(awsExports);


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
