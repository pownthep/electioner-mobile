import { Component } from "@angular/core";
import { getString } from "tns-core-modules/application-settings/application-settings";
import { Fontawesome } from 'nativescript-fontawesome';
Fontawesome.init();

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent { 
    public key = getString("pubKey");
}
