import {Component, ViewEncapsulation} from "@angular/core";
import {ROUTER_DIRECTIVES} from "@angular/router";

declare let jQuery, require: any;

@Component({
  selector: '[about]',
  template: require('./about.html'),
  directives: [ROUTER_DIRECTIVES],
  encapsulation: ViewEncapsulation.None,
  styles: [require('./about.scss')]
})
export class About {
  constructor() {
  }
}
