import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Configs} from "../configurations/configs";

/**
 * @author Amal ROCHD
 * @description web service access point for loading data from server
 * @module Authentication
 */

@Injectable()
export class LoadListService {
  configuration;

  constructor(private http: Http) {
    this.http = http;
  }

  /**
   * @description load a list of countries with their codes
   * @return JSON results in the form of {country name, country code}
   */
  loadCountries(projectTarget) {
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);
    var sql = "SELECT nom, indicatif_telephonique FROM user_pays ORDER BY nom";

    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();

      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  /**
   * @description load a list of nationalities
   * @return JSON results
   */
  loadNationalities() {
    var sql = "select pk_user_nationalite, libelle from user_nationalite where dirty = 'N'";

    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();

      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    })
  }
}
