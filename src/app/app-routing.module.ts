import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [



  {path: 'logChart', redirectTo: 'logChart', pathMatch: 'full'},

  {path: 'Relation', redirectTo: 'Relation/:id', pathMatch: 'full'},
 // {path: '**', redirectTo: 'logChart', pathMatch: 'full'},
  ];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
   ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
