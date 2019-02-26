import { Component, OnInit } from "@angular/core";
import { Page } from "tns-core-modules/ui/page";
import {
    getString,
    setString,
} from "tns-core-modules/application-settings";
import { request } from "tns-core-modules/http";
import * as forge from 'node-forge';
import { confirm } from "tns-core-modules/ui/dialogs";
import { AppState } from '../config'

@Component({
  selector: 'ns-key',
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.css'],
  moduleId: module.id,
})
export class KeyComponent implements OnInit {

  public image = getString("pubQR") ? getString("pubQR") : "~/app/images/key.png";
  public loading = false;
  generate() {
    let options = {
        title: "Digital Key",
        message: "Are you sure you want to be generate new keypair?",
        okButtonText: "Yes",
        cancelButtonText: "No",
    };
    
    confirm(options).then((result: boolean) => {
        if(result) {
            this.loading = true;
            setTimeout(() => {
              var keypair = forge.pki.rsa.generateKeyPair({bits: 512, e: 0x10001});
              setString("privateKey", forge.pki.privateKeyToPem(keypair.privateKey));
              setString("publicKey", forge.pki.publicKeyToPem(keypair.publicKey));
              console.log(forge.pki.publicKeyToPem(keypair.publicKey));
              request({
                  url: AppState.config+"/api/qr",
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  content: JSON.stringify({
                      data: getString("publicKey")
                  })
              }).then((response) => {
                  setString("pubQR", response.content.toJSON());
                  this.loading = false;
                  this.image = getString("pubQR");
                  console.log("Key pair is generated and saved.");
              }, (e) => {
                  console.log(e);
              });
            }, 2000);
        }
    });
  }

  test() {
    request({
        url: AppState.config+"/users/register",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({
            key: getString("publicKey"),
            district: "NakhonRatchasima District 14",
        })
    }).then((response) => {
        console.log(response.content);
    }, (e) => {
        console.log(e);
    });    
  }

  constructor(private page: Page) {
      // Use the component constructor to inject providers.
  }

  ngOnInit(): void {
      // Init your component properties here.
      this.page.actionBarHidden = true;
  }
}
