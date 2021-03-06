import {Component} from "@angular/core";
import {SharedService} from "../../providers/shared.service";
import {Router} from "@angular/router";
import {WalletCreate} from "../wallet-create/wallet-create";
import {SlimPayService} from "../../providers/slimpay-services";
import {AlertComponent} from "ng2-bootstrap/components/alert";
import {Utils} from "../utils/utils";

declare let jQuery: any;

@Component({
  selector: '[payment-method]',
  template: require('./payment-method.html'),
  styles: [require('./payment-method.scss')],
  directives: [WalletCreate, AlertComponent],
  providers: [SlimPayService]
})

export class PaymentMethod{
  projectTarget: string;
  currentUser: any;
  isPayline = false;
  isSlimPay = false;
  alerts: Array<Object>;
  hideLoader = true;
  showChoiceFrame: boolean = true;

  constructor(private sharedService: SharedService,
              private router: Router,
              private slimpayService: SlimPayService){
    this.currentUser = this.sharedService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['home']);
    }
    this.projectTarget = (this.currentUser.estEmployeur ? 'employer' : 'jobyer');
    if (this.projectTarget == "jobyer") {
      this.router.navigate(['home']);
    }

    if(this.currentUser && this.projectTarget == "employer"){
      this.showWalletCreate();
    }
  }

  showWalletCreate(){
    this.isPayline = true;
    this.isSlimPay = false;
    this.alerts = [];
    this.hideLoader = true;
    this.showChoiceFrame = false;
  }

  showSlimPayFrame(){
    this.hideLoader = false;
    this.alerts = [];
    this.isPayline = false;
    this.isSlimPay = true;
    this.showChoiceFrame = false;
    let entrepriseId = this.currentUser.employer.entreprises[0].id;
    this.slimpayService.signSEPA(entrepriseId).then((data: any) => {
      if(!data || this.isEmpty(data.url)){
        this.addAlert("danger", "Erreur: Veuillez recommencer l'opération.")
      }
      //get the SEPA contract url
      let sepaUrl = data.url;
      //Create to Iframe to show the contract in the NavPage
      let iframe = document.createElement('iframe');
      iframe.frameBorder = "0";
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.id = "sepaContract";
      iframe.style.overflow = "hidden";
      iframe.style.height = "100%";
      iframe.style.width = "100%";
      iframe.setAttribute("src", sepaUrl);

      document.getElementById("slimPayIFrame").appendChild(iframe);
      this.hideLoader = true;
    })
  }

  checkSEPAState(){
    let entrepriseId = this.currentUser.employer.entreprises[0].id;
    this.slimpayService.checkSEPARequestState(entrepriseId).then((data :any) => {
      let state = data.data[0].etat;
      if(state == "Attente"){
        this.addAlert("warning", "Veuillez terminer la transaction avant de passer à l'étape suivante");
      }else if(state == "Succès"){
        this.router.navigate(['mission/list']);
      }else{
        this.addAlert("danger", "Votre demande a été rejetée. Nous vous proposons de payer par carte bancaire.");
        this.isPayline = true;
        this.isSlimPay = false;
      }
    })
  }

  closeWalletFrame(params){
    /*if(params.isCanceled){
      this.isPayline = false;
      this.showChoiceFrame = true;
      this.alerts = [];
    }*/
    jQuery('#payment-method').modal('hide');
  }

  cancelSlimPay(){
    this.isSlimPay = false;
    this.showChoiceFrame = true;
    this.alerts = [];
  }

  addAlert(type, msg): void {
    this.alerts = [{type: type, msg: msg}];
  }

  isEmpty(str){
    return Utils.isEmpty(str);
  }
}
