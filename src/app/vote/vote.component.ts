import { Component, OnInit } from '@angular/core';
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { request } from "tns-core-modules/http";
import {
    getString, setBoolean, setString, getBoolean
} from "tns-core-modules/application-settings";
import { confirm, alert } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page/page";
import * as forge from 'node-forge';
import { Fontawesome } from 'nativescript-fontawesome';
Fontawesome.init();

class Item {
    constructor(public name: string, public id: string, public party: string, public url: string) { }
}
@Component({
  selector: 'ns-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css'],
  moduleId: module.id,
})
export class VoteComponent implements OnInit {
    private publicKeyPem = `-----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkHZZK4120cekvdg8UgIU
  Iu033Obajxnd1lJeUdC0puee7G/C0e/iepg5IEU/RDmQFxiJSnppmwadPmGTsyrB
  AgCgf8qaW7jwI9lkIq5PlOuzWREcc1EKqwvB381Et8QtaoiEjv6iGoyHEu8l9Dgy
  0+UK2Wvto07O5lGncLpAiADtGk2ycmqZOkmhYsnFW0xpEIYdaWhMIYKG+DUrVMpD
  0Ntr+zjKtbBYVL5kA6kjdxlKfKGW+tMCdQ8GLQMLVZgH2qrxiTSzUj7OkyXMPGcB
  +UTt985Zk/Ok9jgGRDPS312vKzqFALVj3tX+ZV/g7NyWCkN1LdW9peUZRxqrHxI5
  dwIDAQAB  
  -----END PUBLIC KEY-----`;
  private publicKey;
  private privKey;

  public dataItems: Array<Item>;
  public candidates$;
  public qr = "~/app/images/boy.png";
  public voted: Boolean;
  public authenticated;
  public message;
  public logging = false;
  public transaction = getString('transaction');
  public key = getString("pubKey") ? true : false;

  constructor(private page: Page) {
        console.log(this.key);
        this.voted = false;
        this.authenticated = false;
  }

  onSetupItemView(args: SetupItemViewArgs) {
        args.view.context.third = (args.index % 3 === 0);
        args.view.context.header = ((args.index + 1) % this.candidates$.length === 1);
        args.view.context.footer = (args.index + 1 === this.candidates$.length);
  }


    ngOnInit(): void {
        // Init your component properties here.
        this.page.actionBarHidden = true;
        console.log(this.key);
        this.voted = false;this.authenticated = false;
    }
    login() {
        this.publicKey = forge.pki.publicKeyFromPem(this.publicKeyPem);
        this.privKey = forge.pki.privateKeyFromPem(getString("privateKey"));
        this.logging = true;
        this.dataItems = [];
        request({
            url: "http://192.168.1.3/users/login",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                key: getString("publicKey")
            })
        }).then((response) => {
            this.candidates$ = response.content.toJSON();
            console.log(this.candidates$);
            this.message = (this.candidates$+"").localeCompare("User does not exist") == 0 ? "Please verify your account at the local voting center."+"": "You already voted.";
            if(this.candidates$.length == 0 || (this.candidates$+"").localeCompare("User does not exist") == 0) {
                this.voted = true;
                this.authenticated = true;
                this.logging = false;
            }
            else {
                for (let i = 0; i < this.candidates$.length; i++) {
                    this.dataItems.push(new Item(this.candidates$[i].fname+ " " + this.candidates$[i].lname, this.candidates$[i]._id, this.candidates$[i].party,
                    this.candidates$[i].url));
                }
                this.logging = false;
                this.authenticated = true;
            }
            console.log(this.voted);
        }, (e) => {
            console.log(e);
        });
    }

    onTap(id: string, name: string, party: string){
      var options = {
          title: "You want to vote for: ",
          message: name + " " + party,
          okButtonText: "Yes",
          cancelButtonText: "Cancel",
      };
      confirm(options).then((result: boolean) => {
        if(result) {
            var tmp = this.publicKey.encrypt(id);
            var md = forge.md.sha1.create();
            md.update('sign this', 'utf8');
            var signature = this.privKey.sign(md);  
            request({
                url: "http://192.168.1.3/users/vote",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                    key: getString("publicKey"),
                    data: tmp,
                    signature: signature
                })
            }).then((response) => {
                setString('transaction', response.content+"");
                let options = {
                    title: "Transaction ID",
                    message: response.content+"",
                    okButtonText: "OK"
                };
                this.voted = true;
                this.dataItems = [];
                alert(options).then(() => {
                    
                });
            }, (e) => {
                let options = {
                    title: "Unsuccessful!",
                    message: "Please try again, later.",
                    okButtonText: "OK"
                };
                
                alert(options).then(() => {});
            });
        }
      });
        
    }

}
