import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KycVerificationComponent } from './components/kyc-verification/kyc-verification.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'verify', component: KycVerificationComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
