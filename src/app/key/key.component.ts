import { Component, OnInit } from "@angular/core";
import { Page } from "tns-core-modules/ui/page";
import {
    getString,
    setString,
} from "tns-core-modules/application-settings";
import { request } from "tns-core-modules/http";
import * as forge from 'node-forge';

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
    this.loading = true;
    setTimeout(() => {
      var keypair = forge.pki.rsa.generateKeyPair({bits: 512, e: 0x10001});
      setString("privateKey", forge.pki.privateKeyToPem(keypair.privateKey));
      setString("publicKey", forge.pki.publicKeyToPem(keypair.publicKey));
      request({
          url: "http://35.197.142.51/api/qr",
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

  constructor(private page: Page) {
      // Use the component constructor to inject providers.
  }

  ngOnInit(): void {
      // Init your component properties here.
      this.page.actionBarHidden = true;
  }
}
