import {RouterConfig} from "@angular/router";
import {Core} from "./core";
import {Home} from "./../home/home";
import {Profile} from "../profile/profile";
import {ProfileJobyer} from "../profile-jobyer/profile-jobyer";
import {Settings} from "../settings/settings";
import {Attachements} from "../attachements/attachements";
import {PendingContracts} from "../pending-contracts/pending-contracts";
import {OfferList} from "../offer-list/offer-list";
import {OfferEdit} from "../offer-edit/offer-edit";
import {OfferRecruit} from "../offer-recruit/offer-recruit";
//import {OfferWizard} from "../offer-wizard/offer-wizard";
import {SearchResults} from "../search-results/search-results";
import {SearchDetails} from "../search-details/search-details";
import {SearchCriteria} from "../search-criteria/search-criteria";
import {MissionList} from "../mission-list/mission-list";
import {MissionDetails} from "../mission-details/mission-details";
import {MissionEndReleve} from "../mission-end-releve/mission-end-releve";
import {MissionEndInvoice} from "../mission-end-invoice/mission-end-invoice";
import {Contract} from "../contract/contract";
import {ContractList} from "../contract-list/contract-list";
import {Yousign} from "../yousign/yousign";
import {WalletCreate} from "../wallet-create/wallet-create";
import {MissionPointing} from "../mission-pointing/mission-pointing";
import {RecruiterList} from "../recruiter-list/recruiter-list";
import {RecruiterEdit} from "../recruiter-edit/recruiter-edit";
import {ConfirmExitPage, CanAccessPage} from "../../providers/routes.service";
import {PaymentMethod} from "../payment-method/payment-method";
import {About} from "../about/about";
import {AdvertList} from "../advert-list/advert-list";
import {AdvertEdit} from "../advert-edit/advert-edit";
import {AdvertDetails} from "../advert-details/advert-details";
import {AdvertJobyerList} from "../advert-jobyer-list/advert-jobyer-list";
import {Iframe} from '../iframe/iframe';
import {EntrepriseEdit} from '../entreprise-edit/entreprise-edit';
import {Origine} from "../origine/origine";
// import {List} from "../list/list";
import {OfferTypeList} from "../offer-type-list/offer-type-list";

/**
 * VitOnJob modules
 */

/**
 * This module contains all routes for the project
 */
export const CoreRoutes: RouterConfig = [
  {
    path: '',
    component: Core,
    children: [

      // Application
      {path: 'home', component: Home},
      {path: 'jobyer', component: Home},
      {path: 'employeur', component: Home},

      {path: 'origine', component: Origine, children: [
        {path: '**'}
      ]},

      // {path: 'test', component: List},

      // User parameters
      {path: 'profile', component: Profile, canDeactivate: [ConfirmExitPage]},
      {path: 'profile/jobyer', component: ProfileJobyer},
      {path: 'settings', component: Settings, canDeactivate: [ConfirmExitPage]},

      {path: 'entreprise/edit', component: EntrepriseEdit},

      // Offers management
      {path: 'offer/list', component: OfferList},
      {path: 'offer/type/list', component: OfferTypeList},
      {path: 'offer/edit', component: OfferEdit, canDeactivate: [ConfirmExitPage]},
      {path: 'offer/recruit', component: OfferRecruit, canDeactivate: [ConfirmExitPage]},
      //{path: 'offer/wizard', component: OfferWizard},
      {path: 'offer/jobyer/list', component: AdvertJobyerList},

      // Search management
      {path: 'search/results', component: SearchResults},
      {path: 'search/details', component: SearchDetails},
      {path: 'search/criteria', component: SearchCriteria},

      // Mission management
      {path: 'mission/list', component: MissionList},
      {path: 'mission/list/:type', component: MissionList},
      {path: 'mission/details', component: MissionDetails},
      {path: 'mission/details', component: MissionDetails},
      {path: 'mission/pointing', component: MissionPointing},

      // Contract management
      {path: 'contract/recruitment-form', component: Contract},
      {path: 'contract/recruitment', component: Yousign, canActivate: [CanAccessPage]},
      {path: 'contract/hours-record', component: MissionEndReleve},
      {path: 'contract/invoice', component: MissionEndInvoice},
      {path: 'contract/list', component: ContractList},

      // Payment
      {path: 'wallet/create', component: WalletCreate, canDeactivate: [ConfirmExitPage]},
      {path: 'payment/method', component: PaymentMethod, canActivate: [CanAccessPage]},

      // Grouped recruitment
      {path: 'pendingContracts', component: PendingContracts},
      {path: 'recruiter/list', component: RecruiterList},
      {path: 'recruiter/edit', component: RecruiterEdit},

      // Attachments chest
      {path: 'attachements', component: Attachements},

      // About
      {path: 'about', component: About},

      // Advert
      {path: 'advert/list', component: AdvertList},
      {path: 'advert/edit', component: AdvertEdit},
      {path: 'advert/details', component: AdvertDetails},
      {path: 'advert/jobyer/list', component: AdvertJobyerList},
      // Iframes
      {path: 'iframe/quote', component: Iframe}

      // Extras
      //{path: 'offer/calendar', component: ExtraCalendar}
    ]
  }
];
