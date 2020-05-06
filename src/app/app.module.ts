import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { KeyComponent } from './key/key.component';
import { VoteComponent } from './vote/vote.component';


@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        KeyComponent,
        VoteComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    providers: [

    ]
})
export class AppModule { }
