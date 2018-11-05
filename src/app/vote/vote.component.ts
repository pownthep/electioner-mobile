import { Component, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from "@angular/core";
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { request } from "tns-core-modules/http";
import {
    getString,
    setString,
} from "tns-core-modules/application-settings";
import { confirm } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page/page";

class Item {
    constructor(public name: string, public id: string, public party: string) { }
}
@Component({
  selector: 'ns-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css'],
  moduleId: module.id,
})
export class VoteComponent implements OnInit {

  public options = {
    title: "Race selection",
    message: "Are you sure you want to be a Unicorn?",
    okButtonText: "Yes",
    cancelButtonText: "No",
    neutralButtonText: "Cancel"
  };

  public dataItems: Array<Item>;
  public candidates$;
  public qr = "~/app/images/boy.png";
  constructor(private page: Page) {
      this.dataItems = [];
      request({
          url: "http://35.197.142.51/api/area/01",
          method: "GET"
      }).then((response) => {
          this.candidates$ = response.content.toJSON();

          for (let i = 0; i < this.candidates$.length; i++) {
              this.dataItems.push(new Item(this.candidates$[i].fname+ " " + this.candidates$[i].lname, this.candidates$[i]._id, this.candidates$[i].party));
          }
          console.log(this.dataItems);
      }, (e) => {
          console.log(e);
      });
  }

  onSetupItemView(args: SetupItemViewArgs) {
      args.view.context.third = (args.index % 3 === 0);
      args.view.context.header = ((args.index + 1) % this.candidates$.length === 1);
      args.view.context.footer = (args.index + 1 === this.candidates$.length);
  }


  ngOnInit(): void {
      // Init your component properties here.
      this.page.actionBarHidden = false;
      
  }

  onTap(id: string, name: string, party: string){
      var options = {
          title: name,
          message: party,
          okButtonText: "For",
          cancelButtonText: "Against",
          neutralButtonText: "Cancel"
      };
      confirm(options).then((result: boolean) => {
          console.log(result);
      });
      console.log(id);
  }

}
