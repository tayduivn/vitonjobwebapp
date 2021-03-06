import {Component, OnInit, ElementRef} from "@angular/core";
import {ROUTER_DIRECTIVES, Router, NavigationEnd} from "@angular/router";
import {Location} from "@angular/common";
import {SlimScroll} from "ng2-slimscroll/ng2-slimscroll";
import {ConfigService} from "../config";
import {SharedService} from "../../../providers/shared.service";

declare let jQuery: any;

@Component({
  selector: '[sidebar]',
  directives: [
    ROUTER_DIRECTIVES,
    SlimScroll
  ],
  template: require('./sidebar.html'),
  styles: [require('./sidebar.scss')]
})

export class Sidebar implements OnInit {
  $el: any;
  config: any;
  router: Router;
  location: Location;

  currentUser: any;
  isEmployer: boolean;

  constructor(config: ConfigService, el: ElementRef, router: Router, location: Location, private sharedService: SharedService) {
    this.currentUser = this.sharedService.getCurrentUser();
    if(this.currentUser){
      this.isEmployer = this.currentUser.estEmployeur;
    }else{
      let projectTarget = this.sharedService.getProjectTarget();
      this.isEmployer = (projectTarget == 'employer');
    }
    this.$el = jQuery(el.nativeElement);
    this.config = config.getConfig();
    this.router = router;
    this.location = location;
  }

  initSidebarScroll(): void {
    let $sidebarContent = this.$el.find('.js-sidebar-content');
    if (this.$el.find('.slimScrollDiv').length !== 0) {
      $sidebarContent.slimscroll({
        destroy: true
      });
    }
    $sidebarContent.slimscroll({
      height: window.innerHeight,
      size: '4px'
    });
  }

  changeActiveNavigationItem(location): void {
    this.currentUser = this.sharedService.getCurrentUser();
    let $newActiveLink = this.$el.find('a[href="#' + location.path() + '"]');

    // collapse .collapse only if new and old active links belong to different .collapse
    if (!$newActiveLink.is('.active > .collapse > li > a')) {
      this.$el.find('.active .active').closest('.collapse').collapse('hide');
    }
    this.$el.find('.sidebar-nav .active').removeClass('active');

    $newActiveLink.closest('li').addClass('active')
      .parents('li').addClass('active');

    // uncollapse parent
    $newActiveLink.closest('.collapse').addClass('in').siblings('a[data-toggle=collapse]').removeClass('collapsed');
  }

  ngAfterViewInit(): void {
    this.changeActiveNavigationItem(this.location);
  }

  ngOnInit(): void {
    jQuery(window).on('sn:resize', this.initSidebarScroll.bind(this));
    this.initSidebarScroll();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.changeActiveNavigationItem(this.location);
      }
    });
  }

  logOut() {
    this.currentUser = null;
    this.sharedService.logOut();
    this.router.navigate(['home']);
  }
}
