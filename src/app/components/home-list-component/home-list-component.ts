import {Component, ViewEncapsulation} from "@angular/core";
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from "@angular/router";
import {AlertComponent} from "ng2-bootstrap/components/alert";
import {SearchService} from "../../../providers/search-service";
import {SharedService} from "../../../providers/shared.service";
import {HomeService} from "../../../providers/home.service";
import {Configs} from "../../../configurations/configs";
import {RecruitButton} from "../../components/recruit-button/recruit-button";


declare let jQuery: any;
declare let Swiper: any;

@Component({
  selector: 'home-list-component',
  template: require('./home-list-component.html'),
  directives: [ROUTER_DIRECTIVES, AlertComponent, RecruitButton],
  providers: [SearchService, HomeService],
  styles: [ require('./home-list-component.scss')],
  encapsulation: ViewEncapsulation.None
})

export class HomeList{
  currentUser: any;
  projectTarget: string;
  alerts: Array<Object>;
  hideLoader: boolean = true;
  config: any;

  /*
   *  HOME SCREEN LISTS
   */
  recentOffers: any = [];
  upcomingOffers: any = [];
  recentUsers: any = [];
  previousRecentOffers: any = [];
  previousUpcomingOffers: any = [];

  nextRecentOffers: any = [];
  nextUpcomingOffers: any = [];
  nextRecentUsers: any = [];
  homeServiceData: any = [];
  maxLines: number = 8;
  obj: string;

  currentJobyer: any;

  constructor(private router: Router,
              private searchService: SearchService,
              private homeService: HomeService,
              private route: ActivatedRoute,
              private sharedService: SharedService) {
  }

  ngOnInit(): void {
    //get params
    this.route.params.forEach((params: Params) => {
      this.obj = params['obj'];
    });

    this.currentUser = this.sharedService.getCurrentUser();
    this.projectTarget = this.sharedService.getProjectTarget();


    this.homeService.loadHomeData((this.projectTarget)).then(data => {
      this.homeServiceData = data;
      this.homeService.loadOfferType(this.projectTarget, this.homeServiceData).then(() => {
        this.initHomeList();
      });

    });

    this.config = Configs.setConfigs(this.projectTarget);
    this.sharedService.setCurrentOffer(null);

    jQuery('home-list-component').addClass('fade-in-component');
  }

  cardSwiper(e) {
    new Swiper('.swiper-container', {
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      pagination: '.swiper-pagination',
      grabCursor: true,
    });
  }

  initHomeList() {
    if (!this.homeServiceData || this.homeServiceData.length == 0)
      return;

    //  Let us start with recent offers

    let data = this.homeServiceData.recentOffers;
    let max = data.length > this.maxLines ? this.maxLines : data.length;
    for (let i = 0; i < max; i++) {
      this.recentOffers.push(data[i]);
    }

    for (let i = this.maxLines; i < data.length; i++) {
      this.nextRecentOffers.push(data[i]);
    }

    //  Now we deal with upcoming offers

    data = this.homeServiceData.upcomingOffers;
    max = data.length > this.maxLines ? this.maxLines : data.length;
    for (let i = 0; i < max; i++) {
      this.upcomingOffers.push(data[i]);
    }

    for (let i = this.maxLines; i < data.length; i++) {
      this.nextUpcomingOffers.push(data[i]);
    }

    //  Finally new users

    data = this.homeServiceData.users;
    max = data.length > this.maxLines ? this.maxLines : data.length;
    for (let i = 0; i < max; i++) {
      this.recentUsers.push(data[i]);
    }

    for (let i = this.maxLines; i < data.length; i++) {
      this.nextRecentUsers.push(data[i]);
    }

  }



  onClickCard(e) {

    var el = e.target;
    if (jQuery(el).hasClass('fa'))
      el = jQuery(el).parent('a');

    //jQuery('.material-card > .mc-btn-action').click(function () {
    var card = jQuery(el).parent('.material-card');
    var icon = jQuery(el).children('i');
    icon.addClass('fa-spin-fast');

    if (card.hasClass('mc-active')) {
      card.removeClass('mc-active');

      window.setTimeout(function() {
        icon
          .removeClass('fa-arrow-left')
          .removeClass('fa-spin-fast')
          .addClass('fa-bars');

      }, 100);
    } else {
      card.addClass('mc-active');

      window.setTimeout(function() {
        icon
          .removeClass('fa-bars')
          .removeClass('fa-spin-fast')
          .addClass('fa-arrow-left');

      }, 100);
    }
  }

  nextOffers() {
    if (this.nextRecentOffers.length == 0)
      return;

    this.previousRecentOffers = [];
    for (let i = 0; i < this.recentOffers.length; i++)
      this.previousRecentOffers.push(this.recentOffers[i]);

    this.recentOffers = [];
    for (let i = 0; i < this.nextRecentOffers.length; i++)
      this.recentOffers.push(this.nextRecentOffers[i]);

    this.previousUpcomingOffers = [];
    for (let i = 0; i < this.upcomingOffers.length; i++)
      this.previousUpcomingOffers.push(this.upcomingOffers[i]);

    this.upcomingOffers = [];
    for (let i = 0; i < this.nextUpcomingOffers.length; i++)
      this.upcomingOffers.push(this.nextUpcomingOffers[i]);

    this.nextRecentOffers = [];
    this.nextUpcomingOffers = [];
    let offset = this.homeServiceData.query.startIndexOffers + this.homeServiceData.query.resultCapacityOffers;
    this.homeServiceData.query.startIndexOffers = offset;
    this.homeService.loadMore(this.projectTarget, this.homeServiceData.query.startIndex, this.homeServiceData.query.startIndexOffers).then((data: any) => {
      let newData = data.recentOffers;
      let max = newData.length > this.maxLines ? this.maxLines : newData.length;
      for (let i = 0; i < max; i++) {
        this.nextRecentOffers.push(newData[i]);
      }
      newData = data.upcomingOffers;
      max = newData.length > this.maxLines ? this.maxLines : newData.length;
      for (let i = 0; i < max; i++) {
        this.nextUpcomingOffers.push(newData[i]);
      }
    });
  }

  previousOffers() {
    if (this.previousRecentOffers.length == 0)
      return;
    this.nextRecentOffers = [];
    for (let i = 0; i < this.recentOffers.length; i++)
      this.nextRecentOffers.push(this.recentOffers[i]);

    this.recentOffers = [];
    for (let i = 0; i < this.previousRecentOffers.length; i++)
      this.recentOffers.push(this.previousRecentOffers[i]);

    this.nextUpcomingOffers = [];
    for (let i = 0; i < this.upcomingOffers.length; i++)
      this.nextUpcomingOffers.push(this.upcomingOffers[i]);

    this.upcomingOffers = [];
    for (let i = 0; i < this.previousUpcomingOffers.length; i++)
      this.upcomingOffers.push(this.previousUpcomingOffers[i]);

    this.previousRecentOffers = [];
    this.previousUpcomingOffers = [];
    let offset = this.homeServiceData.query.startIndexOffers - this.homeServiceData.query.resultCapacityOffers;
    if (offset <= 0) {
      offset = 0;
      this.homeServiceData.query.startIndexOffers = offset;
      return;
    }

    this.homeServiceData.query.startIndexOffers = offset;
    this.homeService.loadMore(this.projectTarget, this.homeServiceData.query.startIndex, this.homeServiceData.query.startIndexOffers).then((data: any) => {
      let newData = data.recentOffers;
      let max = newData.length > this.maxLines ? this.maxLines : newData.length;
      for (let i = 0; i < max; i++) {
        this.previousRecentOffers.push(newData[i]);
      }
      newData = data.upcomingOffers;
      max = newData.length > this.maxLines ? this.maxLines : newData.length;
      for (let i = 0; i < max; i++) {
        this.previousUpcomingOffers.push(newData[i]);
      }
    });
  }

  simplifyDate(time) {
    let d = new Date(time);
    let str = d.getDate() + "/";
    str = str + (d.getMonth() + 1) + "/";
    str = str + d.getFullYear();
    return str;
  }

  searchOffer(o) {
    let jobTitle = o.jobTitle;
    let searchFields = {
      class: 'com.vitonjob.callouts.recherche.SearchQuery',
      job: jobTitle,
      metier: '',
      lieu: '',
      nom: '',
      entreprise: '',
      date: '',
      table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
      idOffre: '0',

    };

    this.searchService.criteriaSearch(searchFields, this.projectTarget).then((data: any) => {
      for (let i = 0; i < data.length; i++) {
        let r = data[i];
        if (r.idOffre == o.idOffer) {
          this.sharedService.setSearchResult(r);
          this.router.navigate(['search/details']);
          break;
        }
      }
    });
  }

  onRecruite(o) {
    let jobTitle = o.jobTitle;
    let searchFields = {
      class: 'com.vitonjob.callouts.recherche.SearchQuery',
      job: jobTitle,
      metier: '',
      lieu: '',
      nom: '',
      entreprise: '',
      date: '',
      table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
      idOffre: '0'
    };

    this.searchService.criteriaSearch(searchFields, this.projectTarget).then((data: any) => {
      for (let i = 0; i < data.length; i++) {
        let r = data[i];
        if (r.idOffre == o.idOffer) {

          this.currentJobyer = r.jobyer;
          if (r.obj == "profile") {
            jQuery('#modal-profile').modal('show');
          } else {
            jQuery('#modal-notification-contract').modal('show');
          }
          break;
        }
      }
    });

  }
}
