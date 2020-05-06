import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { HomeComponent } from "./home/home.component";
import { VoteComponent } from "./vote/vote.component";
import { KeyComponent } from "./key/key.component";

const routes: Routes = [
    { path: "", redirectTo: "/(keyTab:key//voteTab:vote)", pathMatch: "full" },
    { path: "vote", component: VoteComponent, outlet: "voteTab" },
    { path: "key", component: KeyComponent, outlet: "keyTab" },
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
