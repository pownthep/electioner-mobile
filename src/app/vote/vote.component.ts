import { Component, OnInit } from '@angular/core';
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { request, getJSON } from "tns-core-modules/http";
import {
    getString, setBoolean, setString, getBoolean
} from "tns-core-modules/application-settings";
import { confirm, alert } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page/page";
import * as forge from 'node-forge';
import * as paillier from 'jspaillier';
import * as BigInteger from 'jsbn';


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
    public encryptionKey; 
    public encryptedData;
    public for;
    public against;
    public baseURL = "https://electioner.tk";
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
        this.voted = false;this.authenticated = false;
        getJSON(this.baseURL+"/users/key").then((r: any) => {
            this.encryptionKey = new paillier.publicKey(r.bits, new BigInteger(r.n));
            this.for = this.encryptionKey.encrypt(new BigInteger('1'));
            this.against = this.encryptionKey.encrypt(new BigInteger('0'));
        }, (e) => {
            console.log(e);
        });
        
        
    }
    login() {
        if(getString('publicKey')) {
            this.logging = true;
            this.dataItems = [];
            request({
                url: this.baseURL+"/users/login",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                    key: getString('publicKey')
                })
            }).then((response) => {
                this.candidates$ = response.content.toJSON();
                console.log(getString('publicKey'));
                console.log(response.content);
                if(!Array.isArray(this.candidates$)) {
                    this.logging = false;
                    this.authenticated = false;
                    let options = {
                        title: "Error",
                        message: this.candidates$+"",
                        okButtonText: "OK"
                    };
                    
                    alert(options).then(() => {
                        
                    });
                }
                else {
                    //console.log(this.candidates$)
                    for (let i = 0; i < this.candidates$.length; i++) {
                        this.dataItems.push(new Item(this.candidates$[i].fname+ " " + this.candidates$[i].lname, this.candidates$[i]._id, this.candidates$[i].party,
                        this.candidates$[i].url));
                    }
                    this.logging = false;
                    this.authenticated = true;
                }
            }, (e) => {
                this.logging = false;
                this.authenticated = false;
                let options = {
                    title: "Error",
                    message: e+"",
                    okButtonText: "OK"
                };
                
                alert(options).then(() => {
                    
                });
                console.log(e);
            });
        }
        else {
            let options = {
                title: "Warning",
                message: "Please generate and verify your public key.",
                okButtonText: "OK"
            };
            
            alert(options).then(() => {
                
            });
        }
        
    }

    onTap(id: string, name: string, party: string, district: string){
      var options = {
          title: "You want to vote for: ",
          message: name + " " + party,
          okButtonText: "Yes",
          cancelButtonText: "Cancel",
      };
      confirm(options).then((result: boolean) => {
        if(result) {
            let data = {};
            for (let item of this.dataItems) {
                if(id.localeCompare(item.id+"")==0) data[id] = this.encryptionKey.encrypt(new BigInteger('1')).toString();
                else data[item.id] = this.encryptionKey.encrypt(new BigInteger('0')).toString();
            }
            console.log(forge.util.bytesToHex(JSON.stringify(data)));
            var md = forge.md.sha1.create();
            md.update('sign this', 'utf8');
            var privKey = forge.pki.privateKeyFromPem(getString('privateKey'));
            var signature = privKey.sign(md);  
            request({
                url: this.baseURL+"/users/vote",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                    key: getString('publicKey'),
                    data: forge.util.bytesToHex(JSON.stringify(data)),
                    signature: signature
                })
            }).then((response) => {
                setString('transaction', response.content+"");
                let options = {
                    title: "Transaction ID",
                    message: response.content+"",
                    okButtonText: "OK"
                };
                this.logging = false;
                this.authenticated = false;
                //this.voted = true;
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
