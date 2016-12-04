import {Component, NgZone, ViewEncapsulation} from "@angular/core";
import {OffersService} from "../../providers/offer.service";
import {DomSanitizationService} from '@angular/platform-browser';
import {SharedService} from "../../providers/shared.service";
import {SearchService} from "../../providers/search-service";
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from "@angular/router";
import {AlertComponent} from "ng2-bootstrap/components/alert";
import {NKDatetime} from "ng2-datetime/ng2-datetime";
import {ModalOptions} from "../modal-options/modal-options";
import {ModalOfferTempQuote} from "../modal-offer-temp-quote/modal-offer-temp-quote";
import {FinanceService} from "../../providers/finance.service";
import {Configs} from "../../configurations/configs";
import {MapsAPILoader} from "angular2-google-maps/core";
import {AddressUtils} from "../utils/addressUtils";
import {LoadListService} from "../../providers/load-list.service";
import {Utils} from "../utils/utils";
import {DateUtils} from "../utils/date-utils";
import {ConventionService} from "../../providers/convention.service";
import {CandidatureService} from "../../providers/candidature-service";
import {SmsService} from "../../providers/sms-service";
import {ModalSlots} from "./modal-slots/modal-slots";

declare var Messenger, jQuery: any;
declare var google: any;
declare var moment: any;
declare var require;

@Component({
  selector: '[offer-edit]',
  template: require('./offer-edit.html'),
  encapsulation: ViewEncapsulation.None,
  styles: [require('./offer-edit.scss')],
  directives: [ROUTER_DIRECTIVES, AlertComponent, NKDatetime, ModalOptions, ModalOfferTempQuote, ModalSlots],
  providers: [OffersService, SearchService, FinanceService, LoadListService, ConventionService, CandidatureService, SmsService]
})

export class OfferEdit{

  selectedJob: any;

  offer: any;
  sectors: any = [];
  jobs: any = [];
  selectedSector: any;
  qualities = [];
  langs = [];
  projectTarget: string;
  currentUser: any;
  slot: any;
  slots = [];
  selectedQuality: any;
  selectedLang: any;
  selectedLevel = "junior";
  slotsToSave = [];
  alerts: Array<Object>;
  alertsSlot: Array<Object>;
  alertsConditionEmp: Array<Object>;
  hideJobLoader: boolean = true;
  datepickerOpts: any;
  obj: string;

  videoAvailable: boolean = false;
  youtubeLink: string;
  youtubeLinkSafe: any;
  isLinkValid: boolean = true;

  /*
   * Collective conventions management
   */
  convention: any;
  niveauxConventions: any = [];
  selectedNivConvID: number = 0;
  categoriesConventions: any = [];
  selectedCatConvID: number = 0;
  echelonsConventions: any = [];
  selectedEchConvID: number = 0;
  coefficientsConventions: any = [];
  selectedCoefConvID: number = 0;
  parametersConvention: any = [];
  selectedParamConvID: number = 0;
  minHourRate: number = 0;
  invalidHourRateMessage: string = '';
  invalidHourRate = false;

  categoriesHeure: any = [];
  majorationsHeure: any = [];
  indemnites: any = [];
  dataValidation: boolean = false;

  offrePrivacyTitle: string;
  autoSearchModeTitle: string;
  modalParams: any = {type: '', message: ''};
  keepCurrentOffer: boolean = false;
  triedValidate: boolean = false;
  isConditionEmpValid = true;
  isConditionEmpExist: boolean = true;

  /*
   * PREREQUIS
   */
  prerequisOb: string = '';
  prerequisObList: any = [];
  prerequisObligatoires: any = [];


  /*
   * EPI
   */
  epi: string = '';
  epiItems: any = [];
  epiList: any = [];

  /*
   * Offer adress
   */
  autocompleteOA: any;
  offerAddress: string;
  nameOA: string;
  streetNumberOA: string;
  streetOA: string;
  zipCodeOA: string;
  cityOA: string;
  countryOA: string;

  addressOptions = {
    componentRestrictions: {country: "fr"}
  };

  //Full time
  isFulltime: boolean = false;
  isPause: boolean = false;
  isOfferInContract: boolean;
  isOfferArchived: boolean;

  //Calendar
  calendar: any;
  $calendar: any;
  dragOptions: Object = { zIndex: 999, revert: true, revertDuration: 0 };
  event: any = {};
  startDate: any;
  endDate: any;
  createEvent: any;
  isEventCreated = false;

  constructor(private sharedService: SharedService,
              public offersService: OffersService,
              private searchService: SearchService,
              private sanitizer: DomSanitizationService,
              private router: Router,
              private financeService: FinanceService,
              private route: ActivatedRoute,
              private zone: NgZone,
              private _loader: MapsAPILoader,
              private listService: LoadListService,
              private conventionService: ConventionService,
              private candidatureService: CandidatureService,
              private smsService: SmsService) {
    this.currentUser = this.sharedService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['home']);
    }
    this.convention = {
      id: 0,
      code: '',
      libelle: ''
    }

    this.offer = this.sharedService.getCurrentOffer();
    this.initCalendar();

  }

  ngOnInit(): void {

    // Init Calendar
    this.$calendar = jQuery('#calendar');
    this.$calendar.fullCalendar(this.calendar);
    jQuery('.draggable').draggable(this.dragOptions);

    //obj = "add", "detail", or "recruit"
    this.route.params.forEach((params: Params) => {
      this.obj = params['obj'];
    });

    this.projectTarget = (this.currentUser.estRecruteur ? 'employer' : (this.currentUser.estEmployeur ? 'employer' : 'jobyer'));

    if (this.projectTarget == "employer" && this.currentUser.employer.entreprises[0].conventionCollective.id > 0) {
      //  Load collective convention
      this.offersService.getConvention(this.currentUser.employer.entreprises[0].conventionCollective.id).then(c => {
        if (c)
          this.convention = c;
        if (this.convention.id > 0) {
          this.offersService.getConventionNiveaux(this.convention.id).then(data => {
            this.niveauxConventions = data;
          });
          this.offersService.getConventionCoefficients(this.convention.id).then(data => {
            this.coefficientsConventions = data;
          });
          this.offersService.getConventionEchelon(this.convention.id).then(data => {
            this.echelonsConventions = data;
          });
          this.offersService.getConventionCategory(this.convention.id).then(data => {
            this.categoriesConventions = data;
          });
          this.offersService.getConventionParameters(this.convention.id).then(data => {
            this.parametersConvention = data;
            this.checkHourRate();
          });

          //get values for "condition de travail"
          if (this.obj != "detail") {
            this.getConditionEmpValuesForCreation();
          } else {
            this.getConditionEmpValuesForUpdate();
          }
        }
      });
    }

    if (this.obj == "detail") {
      this.offer = this.sharedService.getCurrentOffer();

      //this.initCalendar();

      this.isOfferArchived = (this.offer.etat == 'en archive' ? true : false);

      this.isOfferInContract = (this.offer.etat == 'en contrat' ? true : false);
      if(this.isOfferInContract){
        //display alert if offer is in contract
        this.addAlert("info", "Cette offre est en contrat. Vous ne pouvez donc pas la modifier.", "general");
      }

      if (!this.offer.videolink) {
        this.videoAvailable = false;
      } else {
        this.videoAvailable = true;
        this.youtubeLink = this.offer.videolink.replace("youtu.be", "www.youtube.com/embed").replace("watch?v=", "embed/");
        this.youtubeLinkSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.youtubeLink);
      }
      if (this.offer.visible) {
        this.offrePrivacyTitle = this.offer.visible ? "Rendre l'offre privée" : "Rendre l'offre privée";

      }
      else {
        this.offrePrivacyTitle = this.offer.visble ? "Rendre l'offre privée" : "Mettre l'offre en ligne";
      }
      this.autoSearchModeTitle = this.offer.rechercheAutomatique ? "Désactiver la recherche auto" : "Activer la recherche auto";
      if (this.offer.obsolete) {
        //display alert if offer is obsolete
        this.addAlert("warning", "Attention: Cette offre est obsolète. Veuillez mettre à jour les créneaux de disponibilités.", "general");
        //display calendar slots of the current offer
      }
      if (this.offer.jobData.prerequisObligatoires && this.offer.jobData.prerequisObligatoires.length > 0)
        this.prerequisObligatoires = this.offer.jobData.prerequisObligatoires;
      else
        this.prerequisObligatoires = [];

      //epi
      if (this.offer.jobData.epi && this.offer.jobData.epi.length > 0)
        this.epiList = this.offer.jobData.epi;
      else
        this.epiList = [];

      this.offersService.loadOfferAdress(this.offer.idOffer, this.projectTarget).then((data: any) => {
        this.offerAddress = data;
      });
      this.updateConventionParameters(this.offer.idOffer);

      this.slots = this.convertEventsToSlots(this.$calendar.fullCalendar('clientEvents'));
    } else {
      var jobData = {
        'class': "com.vitonjob.callouts.auth.model.JobData",
        job: "",
        sector: "",
        idSector: 0,
        idJob: 0,
        level: 'junior',
        remuneration: null,
        currency: 'euro',
        validated: false,
        prerequisObligatoires: [],
        epi: []
      };
      this.offer = {
        jobData: jobData, calendarData: [], qualityData: [], languageData: [],
        visible: false, title: "", status: "open", videolink: ""
      };
    }

    //load all sectors, if not yet loaded in local
    this.sectors = this.sharedService.getSectorList();
    if (!this.sectors || this.sectors.length == 0) {
      this.offersService.loadSectorsToLocal().then((data: any) => {
        this.sharedService.setSectorList(data);
        this.sectors = data;
      })
    }

    //load all jobs, if not yet loaded in local
    var jobList = this.sharedService.getJobList();
    if (!jobList || jobList.length == 0) {
      this.hideJobLoader = false;
      this.offersService.loadJobsToLocal().then((data: any) => {
        this.sharedService.setJobList(data);
        if (this.obj == "detail") {
          //display selected job of the current offer
          this.sectorSelected(this.offer.jobData.idSector);
        }
        this.hideJobLoader = true;
      })
    } else {
      if (this.obj == "detail") {
        //display selected job of the current offer
        this.sectorSelected(this.offer.jobData.idSector);
      }
    }

    //loadQualities
    this.qualities = this.sharedService.getQualityList();
    if (!this.qualities || this.qualities.length == 0) {
      this.offersService.loadQualities(this.projectTarget).then((data: any) => {
        this.qualities = data.data;
        this.sharedService.setQualityList(this.qualities);
      })
    }

    //loadLanguages
    //  Cette partie est commentée pour forcer les prochaines versions à retélécharger la liste des langues triée
    //this.langs = this.sharedService.getLangList();
    //if (!this.langs || this.langs.length == 0) {
      this.listService.loadLanguages().then((data: any) => {
        this.langs = data.data;
        this.sharedService.setLangList(this.langs);
      });
    //}

    //init slot
    this.slot = {
      date: 0,
      dateEnd: 0,
      startHour: 0,
      endHour: 0,
      pause: false
    };
    //dateoption for slotDate
    this.datepickerOpts = {
      language: 'fr-FR',
      startDate: new Date(),
      autoclose: true,
      todayHighlight: true,
      format: 'dd/mm/yyyy'
    };
  }

  updateConventionParameters(idOffer) {
    this.offersService.getOfferConventionParameters(idOffer).then((parameter: any) => {

      if (parameter.idechelon && parameter.idechelon != null) {
        this.selectedEchConvID = parseInt(parameter.idechelon + '');
      }
      if (parameter.idcat && parameter.idcat != null) {
        this.selectedCatConvID = parseInt(parameter.idcat + '');
      }
      if (parameter.idcoeff && parameter.idcoeff != null) {
        this.selectedCoefConvID = parseInt(parameter.idcoeff + '');
      }
      if (parameter.idniv && parameter.idniv != null) {
        this.selectedNivConvID = parseInt(parameter.idniv + '');
      }
    });
  }

  ngAfterViewInit() {
    var self = this;
    this._loader.load().then(() => {
      this.autocompleteOA = new google.maps.places.Autocomplete(document.getElementById("autocompleteOfferAdress"), this.addressOptions);
    });

    //get timepickers elements
    var elements = []
    jQuery("input[id^='q-timepicker_']").each(function () {
      elements.push(this.id);
    });

    //add change event to endTime timepicker
    jQuery('#' + elements[1]).timepicker().on('changeTime.timepicker', function (e) {
      if (e.time.value == "0:00") {
        jQuery('#' + elements[1]).timepicker('setTime', '11:59 PM');
      }
    });


    // Initialize constraint between sector and job
    let sector = jQuery('.sector-select').select2();
    let job = jQuery('.job-select').select2({
      maximumSelectionLength: 1,
      tokenSeparators: [",", " "],
      createSearchChoice: function (term, data) {
        if (self.jobs.length == 0) {
          return {
            id: '0', libelle: term
          };
        }
      },
      ajax: {
        url: Configs.sqlURL,
        type: 'POST',
        dataType: 'json',
        quietMillis: 250,
        transport: function (params) {
          params.beforeSend = Configs.getSelect2TextHeaders();
          return jQuery.ajax(params);
        },
        data: function (term, page) {
          let idSector = 0;
          if (self.offer && self.offer.jobData && self.offer.jobData.idSector) {
            idSector = self.offer.jobData.idSector;
          }
          return self.offersService.selectJobs(term, idSector);
        },
        results: function (data, page) {
          self.jobs = data.data;
          return {results: data.data};
        },
        cache: false,

      },

      formatResult: function (item) {
        return item.libelle;
      },
      formatSelection: function (item) {
        return item.libelle;
      },
      dropdownCssClass: "bigdrop",
      escapeMarkup: function (markup) {
        return markup;
      },
      minimumInputLength: 1
    });

    sector
      .val(this.offer.jobData.idSector).trigger("change")
      .on("change", function (e) {
          self.sectorSelected(e.val);
        }
      );

    job
      .val(this.offer.jobData.idJob).trigger("change")
      .on("change", function (e) {
          self.jobSelected(e.val);
        }
      );

    if (this.offer.jobData.idJob) {
      this.offersService.selectJobById(this.offer.jobData.idJob).then((job: string) => {
        this.selectedJob = job;
        jQuery(".job-select").select2('data', {id: this.offer.jobData.idJob, libelle: this.selectedJob});
      });
    }


    /*
     * PREREQUIS
     */
    jQuery('.prerequis-select').select2({
      maximumSelectionLength: 1,
      tokenSeparators: [",", " "],
      createSearchChoice: function (term, data) {
        if (self.prerequisObList.length == 0) {
          return {
            id: '0', libelle: term
          };
        }
      },
      ajax: {
        url: Configs.sqlURL,
        type: 'POST',
        dataType: 'json',
        quietMillis: 250,
        transport: function (params) {
          params.beforeSend = Configs.getSelect2TextHeaders();
          return jQuery.ajax(params);
        },
        data: function (term, page) {
          return self.offersService.selectPrerequis(term);
        },
        results: function (data, page) {
          self.prerequisObList = data.data;
          return {results: data.data};
        },
        cache: false,

      },

      formatResult: function (item) {
        return item.libelle;
      },
      formatSelection: function (item) {
        return item.libelle;
      },
      dropdownCssClass: "bigdrop",
      escapeMarkup: function (markup) {
        return markup;
      },
      minimumInputLength: 1
    });
    jQuery('.prerequis-select').on('select2-selecting',
      (e) => {
        self.prerequisOb = e.choice.libelle;
      }
    )

    /*
     * PREREQUIS
     */
    jQuery('.prerequis-jobyer-select').select2({
      maximumSelectionLength: 1,
      tokenSeparators: [",", " "],
      ajax: {
        url: Configs.sqlURL,
        type: 'POST',
        dataType: 'json',
        quietMillis: 250,
        transport: function (params) {
          params.beforeSend = Configs.getSelect2TextHeaders();
          return jQuery.ajax(params);
        },
        data: function (term, page) {
          return self.offersService.selectPrerequis(term);
        },
        results: function (data, page) {
          self.prerequisObList = data.data;
          return {results: data.data};
        },
        cache: false,

      },

      formatResult: function (item) {
        return item.libelle;
      },
      formatSelection: function (item) {
        return item.libelle;
      },
      dropdownCssClass: "bigdrop",
      escapeMarkup: function (markup) {
        return markup;
      },
      minimumInputLength: 1
    });
    jQuery('.prerequis-jobyer-select').on('select2-selecting',
      (e) => {
        self.prerequisOb = e.choice.libelle;
      }
    )

    //epi select2

    jQuery('.epi-select').select2({
      maximumSelectionLength: 1,
      tokenSeparators: [",", " "],
      createSearchChoice: function (term, data) {
        if (self.epiItems.length == 0) {
          return {
            id: '0', libelle: term
          };
        }
      },
      ajax: {
        url: Configs.sqlURL,
        type: 'POST',
        dataType: 'json',
        quietMillis: 250,
        transport: function (params) {
          params.beforeSend = Configs.getSelect2TextHeaders();
          return jQuery.ajax(params);
        },
        data: function (term, page) {
          return self.offersService.selectEPI(term);
        },
        results: function (data, page) {
          self.epiItems = data.data;
          return {results: data.data};
        },
        cache: false,

      },

      formatResult: function (item) {
        return item.libelle;
      },
      formatSelection: function (item) {
        return item.libelle;
      },
      dropdownCssClass: "bigdrop",
      escapeMarkup: function (markup) {
        return markup;
      },
      minimumInputLength: 1
    });
    jQuery('.epi-select').on('select2-selecting',
      (e) => {
        self.epi = e.choice.libelle;
      }
    )

    jQuery('.epi-jobyer-select').select2({
      maximumSelectionLength: 1,
      tokenSeparators: [",", " "],
      ajax: {
        url: Configs.sqlURL,
        type: 'POST',
        dataType: 'json',
        quietMillis: 250,
        transport: function (params) {
          params.beforeSend = Configs.getSelect2TextHeaders();
          return jQuery.ajax(params);
        },
        data: function (term, page) {
          return self.offersService.selectEPI(term);
        },
        results: function (data, page) {
          self.prerequisObList = data.data;
          return {results: data.data};
        },
        cache: false,

      },

      formatResult: function (item) {
        return item.libelle;
      },
      formatSelection: function (item) {
        return item.libelle;
      },
      dropdownCssClass: "bigdrop",
      escapeMarkup: function (markup) {
        return markup;
      },
      minimumInputLength: 1
    });
    jQuery('.epi-jobyer-select').on('select2-selecting',
      (e) => {
        self.epi = e.choice.libelle;
      }
    )
  }

  addPrerequis() {
    if (!this.prerequisOb || this.prerequisOb == '')
      return;
    this.prerequisObligatoires.push(this.prerequisOb);
    this.prerequisOb = '';
  }

  addEPI() {
    if (!this.epi || this.epi == '')
      return;
    this.epiList.push(this.epi);
    this.epi = '';
  }

  removePrerequis(p) {
    let index = -1;
    for (let i = 0; i < this.prerequisObligatoires.length; i++)
      if (this.prerequisObligatoires[i] == p) {
        index = i;
        break;
      }

    if (index < 0)
      return;

    this.prerequisObligatoires.splice(index, 1);
  }

  removeEPI(p) {
    let index = -1;
    for (let i = 0; i < this.epiList.length; i++)
      if (this.epi[i] == p) {
        index = i;
        break;
      }

    if (index < 0)
      return;

    this.epiList.splice(index, 1);
  }

  sectorSelected(sector) {

    //set sector info in jobdata
    this.offer.jobData.idSector = sector;
    //
    var sectorsTemp = this.sectors.filter((v) => {
      return (v.id == sector);
    });
    //get job list
    var jobList = this.sharedService.getJobList();
    this.jobs = jobList.filter((v) => {
      return (v.idsector == sector);
    });
    this.offer.jobData.sector = sectorsTemp[0].libelle;
  }

  /**
   * The job has been selected we will set the offer's job and the conventions data
   * @param idJob
   */
  jobSelected(idJob) {
    this.offer.jobData.idJob = idJob;
    var jobsTemp = this.jobs.filter((v) => {
      return (v.id == idJob);
    });
    this.offer.jobData.job = jobsTemp[0].libelle;

    if (!this.offer.jobData.sector || this.offer.jobData.sector.length == 0) {
      this.offersService.loadSectorByJobId(idJob).then((sector: any) => {
        this.offer.jobData.idSector = sector.id;
        this.offer.jobData.sector = sector.libelle;
        let id = parseInt(this.offer.jobData.idSector);
        this.sectorSelected(id);
        jQuery(".sector-select").select2('val', id);

      });
    }
  }

  watchLevel(e) {

    this.offer.jobData.level = e.target.value;
  }


  //<editor-fold desc="Slots management">

  removeSlot(event) {
    if (this.obj != "detail") {
      //remove event from calendar
      let ev = this.calendar.events.filter((e)=> {
        return (new Date(e.start._d).getTime() == new Date(event.start._d).getTime() && new Date(e.end._d).getTime() == new Date(event.end._d).getTime());
      });
      let index = this.calendar.events.indexOf(ev[0]);
      if (index != -1) {
        this.calendar.events.splice(index, 1);
      }
      this.$calendar.fullCalendar('removeEvents', function (event) {
        return new Date(event.start._d).getTime() == new Date(ev[0].start._d).getTime() && new Date(event.end._d).getTime() == new Date(ev[0].end._d).getTime();
      });
      this.slots.splice(index, 1);
      this.slotsToSave.splice(index, 1);
    } else {
      if(this.offer.calendarData.length == 1){
        this.addAlert("danger", "Une offre doit avoir au moins un créneau de disponibilité. Veuillez ajouter un autre créneau avant de pouvoir supprimer celui-ci.", "slot");
        return;
      }
      //searching event in the calendar events
      let ev = this.calendar.events.filter((e)=> {
        return (e.start == event.start._d.getTime() && e.end == event.end._d.getTime());
      });
      let index = this.calendar.events.indexOf(ev[0]);
      if (index != -1) {
        //removing event from calendar
        this.calendar.events.splice(index, 1);
        //render the calendar with the event removed
        this.$calendar.fullCalendar('removeEvents', function (event) {
          return new Date(event.start._d).getTime() == ev[0].start && new Date(event.end._d).getTime() == ev[0].end;
        });
        //remove slot from local
        this.offer.calendarData.splice(index, 1);
        this.slots.splice(index, 1);
        //remove slot from remote
        this.offersService.updateOfferCalendar(this.offer, this.projectTarget).then(() => {
          this.setOfferInLocal();
          //this.slots = [];
          //this.convertDetailSlotsForDisplay();
        });
      }
    }
    this.closeDetailsModal();
  }

  addSlot(ev) {
    if (this.slot.startHour == 0 || this.slot.endHour == 0) {
      return;
    }

    if (this.obj != "detail") {
      this.slots.push(this.slot);
      this.slotsToSave.push(this.slot);
      return;
    }else{
      if(ev != 'drop'){
        this.slots.push(this.slot);
        let slotClone = this.offersService.cloneSlot(this.slot);
        let slotToSave = this.offersService.convertSlotsForSaving([slotClone]);
        this.offer.calendarData.push(slotToSave[0]);
      }
      this.offersService.updateOfferCalendar(this.offer, this.projectTarget).then(() => {
        this.setOfferInLocal();
        //this.slots = [];
        //this.convertDetailSlotsForDisplay();
      });
    }
  }

  convertSlotsForDisplay(s) {
    var slotTemp = {
      date: this.toDateString(s.date),
      dateEnd: this.toDateString(s.dateEnd),
      startHour: this.toHourString(s.startHour),
      endHour: this.toHourString(s.endHour),
      pause: s.pause
    };
    return slotTemp;
  }

  convertDetailSlotsForDisplay() {
    for (let i = 0; i < this.offer.calendarData.length; i++) {
      var slotTemp = {
        date: this.toDateString(this.offer.calendarData[i].date),
        dateEnd: this.toDateString(this.offer.calendarData[i].dateEnd),
        startHour: this.toHourString(this.offer.calendarData[i].startHour),
        endHour: this.toHourString(this.offer.calendarData[i].endHour),
        pause: this.offer.calendarData[i].pause
      };
      this.slots.push(slotTemp);
    }
  }

  initSlots() {
    for (let i = 0; i < this.offer.calendarData.length; i++) {
      var slotTemp = {
        date: new Date(this.offer.calendarData[i].date),
        dateEnd: new Date(this.offer.calendarData[i].dateEnd),
        startHour: new Date(this.offer.calendarData[i].date),
        endHour: new Date(this.offer.calendarData[i].dateEnd),
        pause: this.offer.calendarData[i].pause
      };
      this.slots.push(slotTemp);
    }
  }

  convertDetailSlotsForCalendar() {
    let events = [];
    if(this.offer){
      for (let i = 0; i < this.offer.calendarData.length; i++) {
        let isPause = this.offer.calendarData[i].pause;
        let startHour = this.toHourString(this.offer.calendarData[i].startHour);
        let endHour = this.toHourString(this.offer.calendarData[i].endHour);
        let startDate = new Date(this.offer.calendarData[i].date);
        let endDate = new Date(this.offer.calendarData[i].dateEnd);
        let title = (isPause ? "Pause de ": "Créneau de ");
        var slotTemp = {
          title: title + startHour + " à " + endHour,
          start: startDate.setHours(+startHour.split(":")[0], +startHour.split(":")[1], 0, 0),
          end: endDate.setHours(+endHour.split(":")[0], +endHour.split(":")[1], 0, 0),
          pause: isPause
        };
        events.push(slotTemp);
      }
    }
    return events;
  }

  convertEventsToSlots(events){
    let eventsConverted = []
    for(let i = 0; i < events.length; i++){
      let slotTemp = {
        date: events[i].start._d,
        dateEnd: events[i].end._d,
        startHour: events[i].start._d,
        endHour: events[i].end._d,
        pause: events[i].pause
      };
      eventsConverted.push(slotTemp);
    }
    return eventsConverted;
  }

  checkHour(slots, slot) {
    this.alertsSlot = [];

    // Compute Minutes format start and end hour of the new slot
    let startHourH = slot.startHour.getHours();
    let startHourM = slot.startHour.getMinutes();
    let startHourTotMinutes = this.offersService.convertHoursToMinutes(startHourH + ':' + startHourM);
    let endHourH = slot.endHour.getHours();
    let endHourM = slot.endHour.getMinutes();
    let endHourTotMinutes = this.offersService.convertHoursToMinutes(endHourH + ':' + endHourM);

    // If end hour is 0:00, force 23:59 such as midnight minute
    if (endHourTotMinutes == 0) {
      endHourTotMinutes = (60 * 24) - 1;
    }

    // Check that today is over than the selected day
    if (Date.now() > slot.date.getTime()) {
      this.addAlert("danger", "La date sélectionnée doit être supérieure ou égale à la date d'aujourd'hui", "slot");
      return false;
    }

    // Check that end hour is over than begin hour
    if (slot.date >= slot.dateEnd) {
      this.addAlert("danger", "L'heure de début doit être inférieure à l'heure de fin", "slot");
      return false;
    }

    // Check that the slot is not overwriting an other one
    if (!slot.pause) {
      //total hours of one day should be lower than 10h
      let isDailyDurationRespected = this.offersService.isDailySlotsDurationRespected(slots, slot);
      if (!isDailyDurationRespected) {
        this.addAlert("danger", "Le total des heures de travail de chaque journée ne doit pas dépasser les 10 heures. Veuillez réduire la durée de ce créneau", "slot");
        return false;
      }

      if(!this.offersService.isSlotRespectsBreaktime(this.slots, this.slot)){
        this.addAlert("danger", "Veuillez mettre un délai de 11h entre deux créneaux situés sur deux jours calendaires différents.", "slot");
        return false;
      }
      for (let i = 0; i < slots.length; i++) {
          // If end hour is 0:00, force 23:59 such as midnight minute
          /*if (slotEndTotMinutes == 0) {
            slotEndTotMinutes = (60 * 24) - 1;
          }*/
          if ((slot.date >= slots[i].date && slot.dateEnd <= slots[i].dateEnd) || (slot.date >= slots[i].date && slot.date < slots[i].dateEnd) || (slot.dateEnd > slots[i].date && slot.dateEnd <= slots[i].dateEnd)) {
            this.addAlert("danger", "Ce créneau chevauche avec un autre", "slot");
            return false;
          }
      }
    } else {
      let isPauseValid = false;
      for (let i = 0; i < slots.length; i++) {
          // If end hour is 0:00, force 23:59 such as midnight minute
          /*if (slotEndTotMinutes == 0) {
            slotEndTotMinutes = (60 * 24) - 1;
          }*/

        if (((slot.date >= slots[i].date && slot.dateEnd <= slots[i].dateEnd) || (slot.date >= slots[i].date && slot.date < slots[i].dateEnd) || (slot.dateEnd > slots[i].date && slot.dateEnd <= slots[i].dateEnd)) && slots[i].pause) {
          this.addAlert("danger", "Cette pause chevauche avec une autre", "slot");
          return false;
        }

        //a break time should be included in a slot
        if (slot.date > slots[i].date && slot.dateEnd < slots[i].dateEnd && !slots[i].pause) {
          isPauseValid = true;
        }
      }
      if (!isPauseValid) {
        this.addAlert("danger", "La période de pause doit être incluse dans l'un des créneaux.", "slot");
        return false;
      }
    }
    return true;
  }

  resetDatetime(componentId) {
    let elements: NodeListOf<Element> = document.getElementById(componentId).getElementsByClassName('form-control');
    (<HTMLInputElement>elements[0]).value = null;
  }

  isDeleteSlotDisabled() {
    return (this.obj == "detail" && this.slots && this.slots.length == 1);
  }

//</editor-fold>

  removeQuality(item) {
    this.offer.qualityData.splice(this.offer.qualityData.indexOf(item), 1);
    if (this.obj == "detail") {
      this.offersService.updateOfferQualities(this.offer, this.projectTarget);
      this.setOfferInLocal();
    }
  }

  addQuality() {
    if (this.isEmpty(this.selectedQuality)) {
      return;
    }
    if (this.obj == "detail") {
      //searching the selected quality in the list of qualities of the current offer
      var q1 = this.offer.qualityData.filter((v) => {
        return (v.idQuality == this.selectedQuality);
      });
      //ignore the add request if quality is already added
      if (this.offer.qualityData.indexOf(q1[0]) != -1) {
        return;
      }
      //searching the selected quality in the generel list of qualities
      var q2 = this.qualities.filter((v) => {
        return (v.idQuality == this.selectedQuality);
      });
      this.offer.qualityData.push(q2[0]);
      this.offersService.updateOfferQualities(this.offer, this.projectTarget);
      this.setOfferInLocal();
    } else {
      var qualitiesTemp = this.qualities.filter((v) => {
        return (v.idQuality == this.selectedQuality);
      });
      if (this.offer.qualityData.indexOf(qualitiesTemp[0]) != -1) {
        return;
      }
      this.offer.qualityData.push(qualitiesTemp[0]);
      this.selectedQuality = "";
    }
  }

  removeLanguage(item) {
    this.offer.languageData.splice(this.offer.languageData.indexOf(item), 1);
    if (this.obj == "detail") {
      this.offersService.updateOfferLanguages(this.offer, this.projectTarget);
      this.setOfferInLocal();
    }
  }

  addLanguage() {
    if (this.isEmpty(this.selectedLang)) {
      return;
    }
    //searching the selected lang in the general list of langs
    var langTemp = this.langs.filter((v) => {
      return (v.id == this.selectedLang);
    });
    //delete the lang from the current offer lang list, if already existant
    if (this.offer.languageData.indexOf(langTemp[0]) != -1) {
      this.offer.languageData.splice(this.offer.languageData.indexOf(langTemp[0]), 1);
    }
    langTemp[0]['level'] = this.selectedLevel;
    this.offer.languageData.push(langTemp[0]);
    if (this.obj == "detail") {
      this.offersService.updateOfferLanguages(this.offer, this.projectTarget);
      this.setOfferInLocal();
    }
    this.selectedLang = "";
  }

  setOfferInLocal() {
    //set offer in local
    if (this.prerequisObligatoires && this.prerequisObligatoires.length > 0)
      this.offer.jobData.prerequisObligatoires = this.prerequisObligatoires;

    if (this.epiList && this.epiList.length > 0)
      this.offer.jobData.epi = this.epiList;

    this.currentUser = this.offersService.spliceOfferInLocal(this.currentUser, this.offer, this.projectTarget);
    this.sharedService.setCurrentUser(this.currentUser);
    this.sharedService.setCurrentOffer(this.offer);
  }

  editOffer() {
    this.triedValidate = true;
    //values of condition de travail should not be null
    if (!this.isConditionEmpValid) {
      return;
    }

    if (this.obj != "detail") {
      this.offer.calendarData = this.offersService.convertSlotsForSaving(this.slotsToSave);
      let roundMin = (Math.round(this.minHourRate * 100) / 100);

      if (!this.offer.jobData.job || this.offer.jobData.job == 0 || !this.offer.jobData.sector || this.offer.jobData.sector == 0 || !this.offer.jobData.remuneration || !this.offer.calendarData || this.offer.calendarData.length == 0 || roundMin > this.offer.jobData.remuneration || !this.offer.nbPoste ||  this.offer.nbPoste <= 0) {
        this.addAlert("warning", "Veuillez saisir les détails du job, ainsi que les disponibilités pour pouvoir valider.", "general");
        return;
      }

      let level = (this.offer.jobData.level === 'senior') ? 'Expérimenté' : 'Débutant';
      this.offer.title = this.offer.jobData.job + " " + level;
      this.offer.identity = (this.projectTarget == 'employer' ? this.currentUser.employer.entreprises[0].id : this.currentUser.jobyer.id);

      //  Deal with requirements
      if (this.prerequisObligatoires && this.prerequisObligatoires.length > 0) {
        this.offer.jobData.prerequisObligatoires = this.prerequisObligatoires;
      } else {
        this.offer.jobData.prerequisObligatoires = [];
      }

      // epi list
      if (this.epiList && this.epiList.length > 0) {
        this.offer.jobData.epi = this.epiList;
      } else {
        this.offer.jobData.epi = [];
      }

      //this.router.navigate(['offer/calendar', {offer: this.offer, isOfferToAdd: true}]);

      this.offersService.setOfferInRemote(this.offer, this.projectTarget).then((data: any) => {
        this.dataValidation = true;
        let offer = JSON.parse(data._body);


        if (this.prerequisObligatoires && this.prerequisObligatoires.length > 0) {
          offer.jobData.prerequisObligatoires = this.prerequisObligatoires;
        }

        if (this.epiList && this.epiList.length > 0) {
          offer.jobData.epi = this.epiList;
        }

        if (this.projectTarget == 'employer') {

          //save values of condition de travail
          this.saveConditionEmp(offer);

          if (this.offerAddress) {

            this.offersService.saveOfferAdress(offer,
              this.offerAddress, this.streetNumberOA,
              this.streetOA, this.cityOA, this.zipCodeOA,
              this.nameOA, this.countryOA,
              this.currentUser.employer.entreprises[0].id,
              "employeur").then(data => {

              offer.adresse = this.offerAddress;
            });
          }
          this.currentUser.employer.entreprises[0].offers.push(offer);
        } else {


          if (this.offerAddress && this.cityOA && this.cityOA.length > 0) {
            this.offersService.saveOfferAdress(offer,
              this.offerAddress, this.streetNumberOA,
              this.streetOA, this.cityOA, this.zipCodeOA,
              this.nameOA, this.countryOA,
              this.currentUser.jobyer.id,
              "jobyer").then(data => {
              offer.adresse = this.offerAddress;
            });
          }
          this.currentUser.jobyer.offers.push(offer);
        }

        // Offer convention parameters

        if (this.projectTarget == 'employer' && this.selectedParamConvID)
          this.offersService.saveOfferConventionParameters(offer.idOffer, this.selectedParamConvID);

        this.sharedService.setCurrentUser(this.currentUser);
        Messenger().post({
          message: "L'offre " + "'" + this.offer.title + "'" + " a été ajoutée avec succès",
          type: 'success',
          showCloseButton: true
        });
        if (this.obj == "add") {
          //redirect to offer-list and display public offers
          this.router.navigate(['offer/list', {typeOfferModel: '0'}]);
        } else {
          this.sharedService.setCurrentOffer(offer);
          this.router.navigate(['search/results', {obj: 'recruit'}]);
        }
      });
    } else {
      if (this.projectTarget == 'employer') {
        //save values of condition de travail
        this.saveConditionEmp(this.offer);

        if (this.offerAddress && this.cityOA && this.cityOA.length > 0) {
          this.offersService.saveOfferAdress(this.offer,
            this.offerAddress, this.streetNumberOA,
            this.streetOA, this.cityOA, this.zipCodeOA,
            this.nameOA, this.countryOA,
            this.currentUser.employer.entreprises[0].id,
            "employer").then(data => {
            this.offer.adresse = this.offerAddress;
          });
        }
      } else {
        if (this.offerAddress && this.cityOA && this.cityOA.length > 0) {
          this.offersService.saveOfferAdress(this.offer,
            this.offerAddress, this.streetNumberOA,
            this.streetOA, this.cityOA, this.zipCodeOA,
            this.nameOA, this.countryOA,
            this.currentUser.jobyer.id,
            "jobyer").then(data => {
            this.offer.adresse = this.offerAddress;
          });
        }
      }

      if (this.projectTarget == 'employer' && this.selectedParamConvID)
        this.offersService.saveOfferConventionParameters(this.offer.idOffer, this.selectedParamConvID);
      this.validateJob();
      if(this.projectTarget == 'employer'){
        this.offersService.updateNbPoste(this.offer.nbPoste, this.offer.idOffer);
      }
    }
  }

  validateJob(stayOnPage = false) {
    // --> Job state
    this.dataValidation = true;
    this.offer.title = this.offer.jobData.job + ' ' + ((this.offer.jobData.level != 'junior') ? 'Expérimenté' : 'Débutant');
    if (!this.offer.jobData.job || !this.offer.jobData.sector || !this.offer.jobData.remuneration || !this.offer.calendarData || this.offer.calendarData.length == 0 || this.minHourRate > this.offer.jobData.remuneration) {
      this.addAlert("warning", "Veuillez saisir les détails du job, ainsi que les disponibilités pour pouvoir valider.", "general");
      return;
    }
    this.dataValidation = true;
    this.offersService.updateOfferJob(this.offer, this.projectTarget);
    this.setOfferInLocal();
    Messenger().post({
      message: "Informations enregistrées avec succès.",
      type: 'success',
      showCloseButton: true
    });

    if (stayOnPage == true) {
      return;
    }

    //redirect to offer-list and display public offers
    var typeOffer = this.offer.visible ? 0 : 1;
    this.router.navigate(['offer/list', {typeOfferModel: typeOffer}]);

  }

  /**
   * @Description Converts a timeStamp to date string
   * @param time : a timestamp date
   */
  toHourString(time: number) {
    let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
    let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
    return hours + ":" + minutes;
  }

  /**
   * @Description Converts a timeStamp to date string :
   * @param date : a timestamp date
   */
  toDateString(date: number) {
    var dateOptions = {
      weekday: "long", month: "long", year: "numeric",
      day: "numeric"//, hour: "2-digit", minute: "2-digit"
    };
    return new Date(date).toLocaleDateString('fr-FR', dateOptions);
  }

  getHourFromDate(time: number) {
    let d = new Date(time);
    let h = d.getHours();
    let m = +d.getMinutes();
    //m = (m.toString().length == 1 ? "0"+m : +m);
    return DateUtils.formatHours(h) + ":" + DateUtils.formatHours(m);
  }

  addAlert(type, msg, section): void {
    if (section == "general"
    ) {
      this.alerts = [{type: type, msg: msg}];
    }
    if (section == "slot") {
      this.alertsSlot = [{type: type, msg: msg}];
    }
    if (section == "conditionEmp") {
      this.alertsConditionEmp = [{type: type, msg: msg}];
    }
  }

  isEmpty(str) {
    if (str == '' || str == 'null' || !str)
      return true;
    else
      return false;
  }

  ngOnDestroy(): void {
    if (this.obj == "detail" && this.keepCurrentOffer === false
    )
      this.sharedService.setCurrentOffer(null);
  }

  formHasChanges() {
    if (this.dataValidation) {
      return false;
    }
    return true;
  }

  videoUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.youtubeLink);
  }

  updateVideo(deleteLink) {
    this.isLinkValid = true;
    if (deleteLink) {
      this.youtubeLink = "";
    } else {
      if (this.youtubeLink == "" || (this.youtubeLink.indexOf("youtu.be") == -1 && this.youtubeLink.indexOf("www.youtube.com") == -1)) {
        this.isLinkValid = false;
        return;
      }
      this.youtubeLink = this.youtubeLink.replace("youtu.be", "www.youtube.com/embed").replace("watch?v=", "embed/");
      this.youtubeLinkSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.youtubeLink);
    }
    this.offersService.updateVideoLink(this.offer.idOffer, this.youtubeLink, this.projectTarget).then(() => {
      if (deleteLink) {
        this.videoAvailable = false;
      } else {
        this.videoAvailable = true;
      }
      this.offer.videolink = this.youtubeLink;
      this.currentUser = this.offersService.spliceOfferInLocal(this.currentUser, this.offer, this.projectTarget);
      this.sharedService.setCurrentUser(this.currentUser);
      this.sharedService.setCurrentOffer(this.offer);
    });
  }

  deleteOffer() {
    this.dataValidation = true;
    this.modalParams.type = "offer.delete";
    this.modalParams.message = "Êtes-vous sûr de vouloir supprimer l'offre " + '"' + this.offer.title + '"' + " ?";
    this.modalParams.btnTitle = "Supprimer l'offre";
    this.modalParams.btnClasses = "btn btn-danger";
    this.modalParams.modalTitle = "Suppression de l'offre";
    jQuery("#modal-options").modal('show')
  }

  copyOffer() {
    this.dataValidation = true;
    this.modalParams.type = "offer.copy";
    this.modalParams.message = "Voulez-vous ajouter une nouvelle offre à partir de celle-ci ?";
    this.modalParams.btnTitle = "Copier l'offre";
    this.modalParams.btnClasses = "btn btn-primary";
    this.modalParams.modalTitle = "Copie de l'offre";
    jQuery("#modal-options").modal('show')
  }

  changePrivacy() {
    this.dataValidation = true;
    var offer = this.offer;
    var statut = offer.visible ? 'Non' : 'Oui';
    this.offersService.updateOfferStatut(offer.idOffer, statut, this.projectTarget).then(() => {
      offer.visible = (statut == 'Non' ? false : true);
      this.currentUser = this.offersService.spliceOfferInLocal(this.currentUser, offer, this.projectTarget);
      this.sharedService.setCurrentUser(this.currentUser);
      if (offer.visible) {
        this.offrePrivacyTitle = this.offer.visible ? "Rendre l'offre privée" : "Rendre l'offre privée";
        Messenger().post({
          message: "Votre offre a bien été déplacée dans «Mes offres en ligne».",
          type: 'success',
          showCloseButton: true
        });
      } else {
        this.offrePrivacyTitle = this.offer.visble ? "Rendre l'offre privée" : "Mettre l'offre en ligne";
        if(this.projectTarget == 'employer'){
          this.candidatureService.getJobyersByOfferCandidature(this.offer.idOffer).then((data: any) => {
            if(data && data.data && data.data.length >= 1){
              for(let i = 0; i < data.data.length; i++){
                let jobyer = data.data[i];
                this.smsService.sendSms(jobyer.telephone, "L'offre " + this.offer.title + " auquelle vous avez postulé, publiée par " + this.currentUser.employer.entreprises[0].nom + " est passée à l'état privée.");
              }
            }
          })
        }
        Messenger().post({
          message: "Votre offre a bien été déplacée dans «Mes offres en brouillon».",
          type: 'success',
          showCloseButton: true
        });
      }
    });
  }

  launchSearch() {
    this.dataValidation = true;
    var offer = this.offer;
    if (!offer)
      return;
    let searchFields = {
      class: 'com.vitonjob.callouts.recherche.SearchQuery',
      job: offer.jobData.job,
      metier: '',
      lieu: '',
      nom: '',
      entreprise: '',
      date: '',
      table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
      idOffre: '0'
    };
    this.searchService.criteriaSearch(searchFields, this.projectTarget).then((data: any) => {
      this.sharedService.setLastResult(data);
      this.sharedService.setCurrentOffer(offer);
      this.keepCurrentOffer = true;
      this.router.navigate(['search/results']);
    });
  }

  autoSearchMode() {
    this.dataValidation = true;
    var offer = this.offer;
    var mode = offer.rechercheAutomatique ? "Non" : "Oui";
    this.offersService.saveAutoSearchMode(this.projectTarget, offer.idOffer, mode).then((data: any) => {
      if (data && data.status == "success") {
        offer.rechercheAutomatique = !offer.rechercheAutomatique;
        this.autoSearchModeTitle = offer.rechercheAutomatique ? "Désactiver la recherche auto" : "Activer la recherche auto";
        this.currentUser = this.offersService.spliceOfferInLocal(this.currentUser, offer, this.projectTarget);
        this.sharedService.setCurrentUser(this.currentUser);
      } else {
        Messenger().post({
          message: "Une erreur est survenue lors de l'enregistrement des données.",
          type: 'success',
          showCloseButton: true
        });
      }
    });
  }

  showQuote() {

    // In order to retrieve updated quote, save current state
    this.validateJob(true);

    let offer = this.sharedService.getCurrentOffer();
    if (offer != null) {
      this.financeService.loadPrevQuotePdf(offer.idOffer).then((data: any) => {

        jQuery("#modal-offer-temp-quote").modal('show');

        let iFrame: HTMLIFrameElement = <HTMLIFrameElement>document.getElementById('pdf-stream');
        iFrame.src = 'data:application/pdf;base64, ' + data.pdf;

      });
    }
  }


//<editor-fold desc="Convention collective management">
  /**
   * If a collective convention is loaded we need to set the salary to the minimum rate of its parameters
   */
  checkHourRate() {
    if (!this.parametersConvention || this.parametersConvention.length == 0)
      return;

    this.selectedParamConvID = this.parametersConvention[0].id;
    this.minHourRate = this.parametersConvention[0].rate;
    for (let i = 1; i < this.parametersConvention.length; i++) {
      if (this.minHourRate > this.parametersConvention[i].rate) {
        this.selectedParamConvID = this.parametersConvention[i].id;
        this.minHourRate = this.parametersConvention[i].rate;
      }
    }

    this.validateRate(this.offer.jobData.remuneration);
  }

  /**
   *
   * @param rate
   * @returns {boolean}
   */
  validateRate(rate) {
    let r = parseFloat(rate);
    let roundMin = (Math.round(this.minHourRate * 100) / 100);

    if (r >= roundMin) {
      this.invalidHourRateMessage = '0.00';
      this.invalidHourRate = false;
      return true;
    }

    this.invalidHourRateMessage = roundMin + '';
    this.invalidHourRate = true;
    return false;
  }


  convParametersVisible() {
    if (!this.parametersConvention || this.parametersConvention.length == 0 || !this.offer.jobData.remuneration || this.offer.jobData.remuneration == 0)
      return false;
    return true;
  }

  convNiveauxVisible() {
    if (!this.niveauxConventions || this.niveauxConventions.length == 0)
      return false;
    return true;
  }

  convCoefficientsVisible() {
    if (!this.coefficientsConventions || this.coefficientsConventions.length == 0)
      return false;
    return true;
  }

  convEchelonsVisible() {
    if (!this.echelonsConventions || this.echelonsConventions.length == 0)
      return false;
    return true;
  }

  convCategoriesVisible() {
    if (!this.categoriesConventions || this.categoriesConventions.length == 0)
      return false;
    return true;
  }

  updateHourRateThreshold(field: string, value: number) {
    if (!this.parametersConvention || this.parametersConvention.length == 0)
      return;

    //  Ensure to take the maximum threshold before checking other options
    for (let i = 0; i < this.parametersConvention.length; i++) {
      if (this.minHourRate <= this.parametersConvention[i].rate) {
        this.selectedParamConvID = this.parametersConvention[i].id;
        this.minHourRate = this.parametersConvention[i].rate;
      }
    }

    //  Now let's seek the suitable parameters
    for (let i = 0; i < this.parametersConvention.length; i++) {

      if (field == 'CAT' && value > 0 && this.parametersConvention[i].idcat != value)
        continue;
      if (field == 'COEF' && value > 0 && this.parametersConvention[i].idcoeff != value)
        continue;
      if (field == 'ECH' && value > 0 && this.parametersConvention[i].idechelon != value)
        continue;
      if (field == 'NIV' && value > 0 && this.parametersConvention[i].idniv != value)
        continue;

      if (this.minHourRate > this.parametersConvention[i].rate) {
        this.selectedParamConvID = this.parametersConvention[i].id;
        this.minHourRate = this.parametersConvention[i].rate;
      }
    }

    this.validateRate(this.offer.jobData.remuneration);
  }

  watchOfferAddress(e) {

    let _address = e.target.value;
    let _hint: string = "";

    this.nameOA = _address;
    this.streetNumberOA = "";
    this.streetOA = "";
    this.zipCodeOA = "";
    this.cityOA = "";
    this.countryOA = "";

    this.offerAddress = _address;
  }

  autocompleteOfferAddress() {

    this._loader.load().then(() => {

      //let autocomplete = new google.maps.places.Autocomplete(document.getElementById("autocompletePersonal"), {});
      google.maps.event.addListener(this.autocompleteOA, 'place_changed', () => {
        let place = this.autocompleteOA.getPlace();
        var addressObj = AddressUtils.decorticateGeolocAddress(place);

        this.offerAddress = place['formatted_address'];
        this.zone.run(() => {
          this.nameOA = !addressObj.name ? '' : addressObj.name.replace("&#39;", "'");
          this.streetNumberOA = addressObj.streetNumber.replace("&#39;", "'");
          this.streetOA = addressObj.street.replace("&#39;", "'");
          this.zipCodeOA = addressObj.zipCode;
          this.cityOA = addressObj.city.replace("&#39;", "'");
          this.countryOA = (addressObj.country.replace("&#39;", "'") == "" ? 'France' : addressObj.country.replace("&#39;", "'"));

        });
      });
    });
  }

  watchFullTime(e) {
    this.isFulltime = e.target.checked;
    if (this.isFulltime) {
      this.slot.startHour = new Date(new Date().setHours(9, 0, 0, 0));
      this.slot.endHour = new Date(new Date().setHours(17, 0, 0, 0));
      this.slot.pause = false;
      this.isPause = false;
    }
  }

  watchPause(e) {
    this.isPause = e.target.checked;
    if (this.isPause) {
      this.isFulltime = false;
      this.slot.pause = true;
    } else {
      this.slot.pause = false;
    }
  }

  watchConditionEmp(e, item) {
    this.alertsConditionEmp = [];
    this.isConditionEmpValid = true;
    if (+e.target.value < item.coefficient || Utils.isEmpty(e.target.value)) {
      this.addAlert("danger", "Les valeurs définies par l'employeur doivent être supérieures ou égales à celles définies par la convention collective.", "conditionEmp");
      this.isConditionEmpValid = false;
      e.target.value = this.decimalAdjust('round', item.coefficient, -2).toFixed(2);
    }
    e.target.value = this.decimalAdjust('round', e.target.value, -2).toFixed(2);//e.target.value.toFixed(2);
  }

  decimalAdjust(type, value, exp) {
  // Si la valeur de exp n'est pas définie ou vaut zéro...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // Si la valeur n'est pas un nombre
  // ou si exp n'est pas un entier...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Décalage
  value = value.toString().split('e');
  value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Décalage inversé
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

  saveConditionEmp(offer) {
    if (this.obj != 'detail' || !this.isConditionEmpExist) {
      this.conventionService.createConditionEmploi(offer.idOffer, this.conventionService.convertPercentToRaw(this.categoriesHeure), this.conventionService.convertPercentToRaw(this.majorationsHeure), this.conventionService.convertPercentToRaw(this.indemnites)).then((data: any) => {
        if (!data || data.status == "failure") {
          this.addAlert("danger", "Erreur lors de la sauvegarde des données.", "general");
        }
      })
    } else {
      this.conventionService.updateConditionEmploi(this.offer.idOffer, this.conventionService.convertPercentToRaw(this.categoriesHeure), this.conventionService.convertPercentToRaw(this.majorationsHeure), this.conventionService.convertPercentToRaw(this.indemnites)).then((data: any) => {
        if (!data || data.status == "failure") {
          this.addAlert("danger", "Erreur lors de la sauvegarde des données.", "general");
        }
      })
    }
  }

  getConditionEmpValuesForCreation() {
    this.offersService.getHoursCategories(this.convention.id).then(data => {
      this.categoriesHeure = this.conventionService.convertValuesToPercent(data);
    });
    this.offersService.getHoursMajoration(this.convention.id).then(data => {
      this.majorationsHeure = this.conventionService.convertValuesToPercent(data);
    });
    this.offersService.getIndemnites(this.convention.id).then(data => {
      this.indemnites = this.conventionService.convertValuesToPercent(data);
    });
  }

  getConditionEmpValuesForUpdate() {
    this.conventionService.getHoursCategoriesEmp(this.convention.id, this.offer.idOffer).then((data: any) => {
      if (!data || data.length == 0) {
        this.isConditionEmpExist = false;
        this.offersService.getHoursCategories(this.convention.id).then(data => {
          this.categoriesHeure = this.conventionService.convertValuesToPercent(data);
        });
      } else {
        this.isConditionEmpExist = true;
        this.categoriesHeure = this.conventionService.convertValuesToPercent(data);
      }
    });

    this.conventionService.getHoursMajorationEmp(this.convention.id, this.offer.idOffer).then((data: any) => {
      if (!data || data.length == 0) {
        this.isConditionEmpExist = false;
        this.offersService.getHoursMajoration(this.convention.id).then(data => {
          this.majorationsHeure = this.conventionService.convertValuesToPercent(data);
        });
      } else {
        this.isConditionEmpExist = true;
        this.majorationsHeure = this.conventionService.convertValuesToPercent(data);
      }
    });
    this.conventionService.getIndemnitesEmp(this.convention.id, this.offer.idOffer).then((data: any) => {
      if (!data || data.length == 0) {
        this.isConditionEmpExist = false;
        this.offersService.getIndemnites(this.convention.id).then(data => {
          this.indemnites = this.conventionService.convertValuesToPercent(data);
        });
      } else {
        this.isConditionEmpExist = true;
        this.indemnites = this.conventionService.convertValuesToPercent(data);
      }
    });
  }

  preventNull(str) {
    return Utils.preventNull(str);
  }


  // calendar functions
  addEvent(event): void {
    this.calendar.events.push(event);
  };

  changeView(view): void {
    this.$calendar.fullCalendar('changeView', view);
  };

  currentMonth(): string {
    return moment(this.$calendar.fullCalendar('getDate')).format('MMM YYYY');
  };

  currentDay(): string {
    return moment(this.$calendar.fullCalendar('getDate')).format('dddd');

  };

  prev(): void {
    this.$calendar.fullCalendar('prev');
  };

  next(): void {
    this.$calendar.fullCalendar('next');
  };

  initCalendar() {
    let date = new Date();
    let d = date.getDate();
    let m = date.getMonth();
    let y = date.getFullYear();

    //get params
    /*this.route.params.forEach((params: Params) => {
     this.offer = params['offer'];
     this.isOfferToAdd = params['isOfferToAdd'];
     });*/

    this.calendar = {
      header: {
        left: '',
        center: 'title',
        right: false
      },
      views: {
        month: { // name of view
          titleFormat: 'MMMM YYYY'
        }
      },
      axisFormat: 'H:mm',
      slotDuration: '00:15:00',
      allDayText:"Au-delà d'un seul jour",
      events: this.convertDetailSlotsForCalendar(),
      selectable: true,
      selectHelper: true,
      eventDurationEditable: false,
      eventStartEditable: true,

      select: (start, end, allDay): void => {
        this.startDate = start._d;
        this.endDate = end._d;
        this.createEvent = () => {
          this.addSlotInCalendar(start, end, allDay);
        };
        this.resetSlotModal();
        jQuery('#create-event-modal').modal('show');
      },

      eventClick: (event): void => {
        this.event = event;
        jQuery('#show-event-modal').modal('show');
      },

      eventDrop: (event, delta, revertFunc): void => {
        this.dragSlot(event, revertFunc);
      },
      lang : 'fr'
    };
  }

  addSlotInCalendar(start, end, allDay){
    let hs = this.slot.startHour.getHours();
    let ms = this.slot.startHour.getMinutes();
    let he = this.slot.endHour.getHours();
    let me = this.slot.endHour.getMinutes();
    start._d.setHours(hs, ms, 0, 0);
    end._d.setDate(end._d.getDate() - 1);
    end._d.setHours(he, me, 0, 0);
    //slots should be coherent
    this.slot.date = start._d;
    this.slot.dateEnd = end._d;
    if (this.checkHour(this.slots, this.slot) == false) {
      end._d.setDate(end._d.getDate() + 1);
      return;
    }
    // Show add offer form:
    //this.isEventCreated = true;
    //render slot in the calendar
    let title = (!this.slot.pause ? "Créneau de " : "Pause de ");
    let evt = {
      title: title + DateUtils.formatHours(hs) + ":" + DateUtils.formatHours(ms) + " à " + DateUtils.formatHours(he) + ":" + DateUtils.formatHours(me),
      start: start,
      end: end,
      //allDay is bugged, must be false
      allDay: false,
      //description: 'ici je peux mettre une description de l\'offre',
      backgroundColor: '#64bd63',
      textColor: '#fff',
      pause: this.slot.pause
    }
    if (title) {
      this.$calendar.fullCalendar('renderEvent',
        evt,
        true // make the event "stick"
      );
      this.addEvent(evt);
      this.addSlot('');
    }
    this.$calendar.fullCalendar('unselect');
    jQuery('#create-event-modal').modal('hide');
    this.resetSlotModal();
  }

  dragSlot(event, revertFunc){
    this.slot.date = event.start._d;
    this.slot.dateEnd = event.end._d;
    this.slot.startHour = event.start._d;
    this.slot.endHour = event.end._d;
    this.slot.pause = event.pause;
    let evs = this.$calendar.fullCalendar('clientEvents');
    let slotsForDragEv = this.offersService.getSlotsForDraggingEvent(evs, this.slots);
    if(slotsForDragEv && slotsForDragEv.length > 0) {
      if (!this.checkHour(slotsForDragEv, this.slot)) {
        this.slot = {
          date: 0,
          dateEnd: 0,
          startHour: 0,
          endHour: 0,
          pause: false
        };
        revertFunc();
        return;
      }
      this.slots = [];
      this.slots = this.convertEventsToSlots(evs);
      if (this.obj != "detail") {
        this.slotsToSave = [];
        this.slotsToSave = this.convertEventsToSlots(evs);
        this.resetSlotModal();
      } else {
        this.offer.calendarData = [];
        this.offer.calendarData = this.offersService.convertSlotsForSaving(this.slots);
        this.addSlot("drop");
      }
    }else{
      this.resetSlotModal();
      revertFunc();
      return;
    }
  }

  resetSlotModal(){
    this.resetDatetime('slotEHour');
    this.resetDatetime('slotSHour');
    this.slot = {
      date: 0,
      dateEnd: 0,
      startHour: 0,
      endHour: 0,
      pause: false
    };
    this.alertsSlot = [];
    this.isFulltime = false;
    this.isPause = false;
  }

  closeModal(){
    this.resetSlotModal();
    jQuery('#create-event-modal').modal('hide');
  }

  closeDetailsModal(){
    this.alertsSlot = [];
    jQuery('#show-event-modal').modal('hide');
  }
}
