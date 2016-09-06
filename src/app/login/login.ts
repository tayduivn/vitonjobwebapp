import {Component, ViewEncapsulation} from '@angular/core';
import {ROUTER_DIRECTIVES, Router} from '@angular/router';
import {LoadListService} from "../providers/load-list.service";
import {AuthenticationService} from "../providers/authentication.service";
import {ValidationDataService} from "../providers/validation-data.service";
import {SharedService} from "../providers/shared.service";
declare function md5(value: string): string;
//declare var jQuery: any;

@Component({
  directives: [
    ROUTER_DIRECTIVES
  ],
  selector: '[login]',
  host: {
    class: 'login-page app'
  },
  template: require('./login.html'),
  encapsulation: ViewEncapsulation.None,
  styles: [require('./login.scss')],
  providers: [AuthenticationService, LoadListService, ValidationDataService]
})
export class LoginPage {
	index: number;
	phone: number;
	email: string; 
	password1: string;
	password2: string;
	role: string;
	pays = [];
	
	isIndexValid =true;
	isPhoneNumValid = true;
	showEmailField: boolean;
	emailExist = false;
	isRecruteur : boolean = false;
	isNewRecruteur: boolean = false
	
	libelleButton: string;
	fromPage: string;
	
	constructor(private loadListService: LoadListService, 
				private authService: AuthenticationService,
				private validationDataService: ValidationDataService,
				private sharedService: SharedService,
				private router: Router){}
	
	ngOnInit(): void {
		//jQuery('.select2').select2();
		this.index = 33;
		this.libelleButton = "Se connecter";
		this.role = "employer";
		//load countries list
		this.loadListService.loadCountries(this.role).then((data: any) => {
			this.pays = data.data;
		});
		
	}
	
	authenticate(){
		//in case email was changed just before validate button is clicked
		if(this.isAuthDisabled()){
			return;
		}
		var indPhone = this.index + "" + this.phone;
		//call the service of autentication
		let pwd = md5(this.password1);
		if(this.email == null || this.email == 'null')
			this.email = '';
		this.authService.authenticate(this.email, indPhone, pwd, this.role, this.isRecruteur).then((data: any) => {
			console.log(data);
			//case of authentication failure : server unavailable or connection probleme 
			if (!data || data.length == 0 || (data.id == 0 && data.status == "failure")) {
				//this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
				return;
			}
			//case of authentication failure : incorrect password 
			if (data.id == 0 && data.status == "passwordError") {
				console.log("Password error");
				if(!this.showEmailField){
					//this.globalService.showAlertValidation("VitOnJob", "Votre mot de passe est incorrect.");
				}else{
					console.log("used email error");
					//this.globalService.showAlertValidation("VitOnJob", "Cette adresse email a été déjà utilisé. Veuillez en choisir une autre.");
				}
				return;
			}
			//store current user in session
			this.sharedService.setCurrentUser(data);
			//if user is connected for the first time, redirect him to the page 'civility', otherwise redirect him to the home page
			var isNewUser = data.newAccount;
			if (isNewUser || this.isNewRecruteur) {
				//this.nav.setRoot(CivilityPage, {currentUser: data});
				this.router.navigate(['/form-elements']);
			 } else {
				if(this.fromPage == "Search"){
					//this.nav.pop();
				}else{
					this.router.navigate(['/dashboard']);
				}
			}
		
		});
	}
	
	/**
		* @description validate phone data field and call the function that search for it in the server
	*/
	watchPhone(e) {
		console.log(this.role);
		if (this.phone) {
			if (e.target.value.substring(0,1) == '0') {
				e.target.value = e.target.value.substring(1, e.target.value.length);
			}
			if(e.target.value.length > 9){
				e.target.value = e.target.value.substring(0, 9);
			}
			if (e.target.value.length == 9) {
				this.isRegistration(this.index, e.target.value);
				this.isPhoneNumValid = true;
			}
		}
	}
	
	/**
		* @description function called when the phone input is valid to decide if the form is for inscription or authentication
	*/
	isRegistration(index, phone) {
		if (this.isPhoneValid(phone)) {
			//On teste si le tél existe dans la base
			var tel = "+" + index + phone;
			this.authService.getUserByPhone(tel, this.role).then((data: any) => {
				if (!data || data.status == "failure") {
					console.log(data);
					//this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
					return;
				}
				if (!data || data.data.length == 0) {
					this.showEmailField = true;
					this.email = "";
					this.libelleButton = "S'inscrire";
					//this.isNewRecruteur = false;
				} else {
					this.email = data.data[0]["email"];
					this.libelleButton = "Se connecter";
					this.showEmailField = false;
					if(data.data[0]["role"] == "recruteur" && this.role == "employer"){
						this.isRecruteur = true;
						this.email = "";
					}
				}
			});
			} else {
			//ça sera toujours une connexion
			this.showEmailField = true;
			this.libelleButton = "S'inscrire";
			this.email = "";
			this.isRecruteur = false;
		}
	}
	
	/**
		* @description validate the phone format
	*/
	isPhoneValid(tel) {
		if (this.phone) {
			var phone_REGEXP = /^0/;
			//check if the phone number start with a zero
			var isMatchRegex = phone_REGEXP.test(tel);
			if (Number(tel.length) == 9 && !isMatchRegex) {
				console.log('phone number is valid');
				return true;
			}
			else
			return false;
		} else
		return false;
	}
	
	validatePhone(e){
		if(e.target.value.length == 9){
			this.isPhoneNumValid = true;	
		}else{
			this.isPhoneNumValid = false;	
		}
	}
	
	isEmailExist(e){
		//verify if the email exist in the database
		this.authService.getUserByMail(this.email, this.role).then((data: any) => {
			if (!data || data.status == "failure") {
				console.log(data);
				//this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
				return;
			}
			if (data && data.data.length != 0) {
				this.emailExist = true;
			}else{
				this.emailExist = false;
			}
		});
	}
	
	/**
		* @description validate the email format
	*/
	showEmailError() {
		if(this.isRecruteur)
			return false;
		if(this.email)
			return !(this.validationDataService.checkEmail(this.email));
		else
			return false;
	}
	
	/**
		* @description show error msg if password is not valid
	*/
	showPassword1Error(){
		if(this.password1)
		return this.password1.length < 6;
	}
	
	/**
		* @description check if the password and its confirmation are the same 
	*/
	showPassword2Error(){
		if(this.password2)
		return this.password2 != this.password1;
	}
	
	/**
		* @description function called to decide if the auth/inscr button should be disabled
	*/
	isAuthDisabled() {
		if (this.showEmailField == true) {
			//inscription
			return (!this.index || !this.isIndexValid || !this.phone || !this.isPhoneNumValid || !this.password1 || this.showPassword1Error() || !this.password2 || this.showPassword2Error() || !this.email || this.showEmailError() || this.emailExist || !this.role)
			} else {
			//connection
			return (!this.index || !this.isIndexValid || !this.phone || !this.isPhoneNumValid || !this.password1 || this.showPassword1Error() || !this.role)
		}
	}
	
	watchRole(e){
		this.role = e.target.value;
	}
	
	isEmpty(str){
		if(str == '' || str == 'null' || !str)
			return true;
		else
			return false;
	}
}
