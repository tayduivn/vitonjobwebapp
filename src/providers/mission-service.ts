import {Injectable} from '@angular/core';
import {Configs} from '../configurations/configs';
import {Http, Headers} from '@angular/http';
import {Utils} from "../app/utils/utils";
import {DateUtils} from "../app/utils/date-utils";
import {HeureMission} from "../dto/heureMission";

// import {GlobalConfigs} from '../configurations/globalConfigs';
// import {Storage, SqlStorage} from 'ionic-angular';
// import {LocalNotifications} from 'ionic-native';

@Injectable()
export class MissionService {

  configuration: any;
  projectTarget: string;
  data: any;

  constructor(public http: Http) {
    // this.db = new Storage(SqlStorage);
    // Get target to determine configs
    // this.projectTarget = gc.getProjectTarget();
    this.configuration = Configs.setConfigs('employer');
  }

  absence(day) {
    let sql = "update user_heure_mission set absence='Oui' where pk_user_heure_mission="+day.id;

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map((res) => res.json())
        .subscribe((data) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  listMissionHours(contract, forPointing) {
    let sql="";
    sql = "SELECT h.pk_user_heure_mission as id, " +
      "h.jour_debut, h.jour_fin, " +
      "h.heure_debut, h.heure_fin, " +
      "h.date_debut_new, h.date_fin_new, " +
      "h.date_debut_pointe, h.date_fin_pointe, " +
      "h.date_debut_pointe_modifie, h.date_fin_pointe_modifie, " +
      "h.date_debut_pointe_corrige, h.date_fin_pointe_corrige, " +
      "h.est_heure_debut_aime, h.est_heure_fin_aime, " +
      "h.debut_corrigee as is_heure_debut_corrigee, h.fin_corrigee as is_heure_fin_corrigee, " +
      "h.heure_debut_new, h.heure_fin_new, h.absence, " +
      "p.debut as pause_debut, p.fin as pause_fin, " +
      "p.debut_pointe as pause_debut_pointe, p.fin_pointe as pause_fin_pointe, " +
      "p.debut_corrigee as is_pause_debut_corrigee, p.fin_corrigee as is_pause_fin_corrigee, " +
      "p.debut_new as pause_debut_new, p.fin_new as pause_fin_new, " +
      "p.pk_user_pause as id_pause " +
      "FROM user_heure_mission as h LEFT JOIN user_pause as p ON p.fk_user_heure_mission = h.pk_user_heure_mission " +
      "where fk_user_contrat = '" + contract.pk_user_contrat + "' " +
      "order by h.jour_debut, p.debut";

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map((res) => res.json())
        .subscribe((data) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  constructMissionHoursArray(initialMissionArray) {
    //index of pause :a mission can have many pauses
    let ids = [];
    let missionHours: HeureMission[] = [];
    let missionPauses = [[]];
    let k = 0;
    for (let i = 0; i < initialMissionArray.length; i++) {
      let m = initialMissionArray[i];
      //if the mission is not yet pushed
      if (ids.indexOf(m.id) == -1) {
        //push the mission
        m.date_debut_new = DateUtils.convertToFormattedDateHour(new Date(m.date_debut_new));
        m.date_fin_new = DateUtils.convertToFormattedDateHour(new Date(m.date_fin_new));
        m.date_debut_pointe = DateUtils.convertToFormattedDateHour(new Date(m.date_debut_pointe));
        m.date_fin_pointe = DateUtils.convertToFormattedDateHour(new Date(m.date_fin_pointe));
        m.date_debut_pointe_modifie = DateUtils.convertToFormattedDateHour(new Date(m.date_debut_pointe_modifie));
        m.date_fin_pointe_modifie = DateUtils.convertToFormattedDateHour(new Date(m.date_fin_pointe_modifie));
        m.date_debut_pointe_corrige = DateUtils.convertToFormattedDateHour(new Date(m.date_debut_pointe_corrige));
        m.date_fin_pointe_corrige = DateUtils.convertToFormattedDateHour(new Date(m.date_fin_pointe_corrige));
        missionHours.push(m);
        k = missionHours.length - 1;
        //push the id mission to prebent stocking the same mission many times
        ids.push(m.id);
        //push the pauses
        if (m.id_pause != "null") {
          missionPauses[k] = [{}];
          missionPauses[k][0].id = m.id_pause;
          missionPauses[k][0].pause_debut =  this.convertToFormattedHour(m.pause_debut);
          missionPauses[k][0].pause_fin =  this.convertToFormattedHour(m.pause_fin);
          missionPauses[k][0].pause_debut_pointe = this.convertToFormattedHour(m.pause_debut_pointe);
          missionPauses[k][0].pause_fin_pointe = this.convertToFormattedHour(m.pause_fin_pointe);
          missionPauses[k][0].is_pause_debut_corrigee = m.is_pause_debut_corrigee;
          missionPauses[k][0].is_pause_fin_corrigee = m.is_pause_fin_corrigee;
          missionPauses[k][0].pause_debut_new = m.pause_debut_new;
          missionPauses[k][0].pause_fin_new = m.pause_fin_new;
        }
      } else {
        //if the mission is already pushed, just push its pause
        let idExistMission = ids.indexOf(m.id);
        let j = missionPauses[idExistMission].length;
        if (m.id_pause != "null") {
          missionPauses[idExistMission][j] = {};
          missionPauses[idExistMission][j].id = m.id_pause;
          missionPauses[idExistMission][j].pause_debut =  this.convertToFormattedHour(m.pause_debut);
          missionPauses[idExistMission][j].pause_fin =  this.convertToFormattedHour(m.pause_fin);
          missionPauses[idExistMission][j].pause_debut_pointe = this.convertToFormattedHour(m.pause_debut_pointe);
          missionPauses[idExistMission][j].pause_fin_pointe = this.convertToFormattedHour(m.pause_fin_pointe);
          missionPauses[idExistMission][j].is_pause_debut_corrigee = m.is_pause_debut_corrigee;
          missionPauses[idExistMission][j].is_pause_fin_corrigee = m.is_pause_fin_corrigee;
          missionPauses[idExistMission][j].pause_fin_new = m.pause_fin_new;
          missionPauses[idExistMission][j].pause_debut_new = m.pause_debut_new;
        }
      }
    }
    return [missionHours, missionPauses];
  }

  /*addPauses(missionHours, missionPauses, contractId) {
    //  Init project parameters
    var sql = "update user_contrat set vu = 'Oui' where pk_user_contrat = '" + contractId + "'; ";

    var valuesString = "";
    for (var i = 0; i < missionHours.length; i++) {
      if (missionPauses[i]) {
        for (var j = 0; j < missionPauses[i].length; j++) {
          //convert startpausehour and endpausehour to minutes
          var startMinute = this.convertHoursToMinutes(missionPauses[i][j].pause_debut_temp);
          var endMinute = this.convertHoursToMinutes(missionPauses[i][j].pause_fin_temp);
          valuesString = valuesString + "(" + missionHours[i].id + ", " + startMinute + ", " + endMinute + "),";

        }
      }
    }
    if (valuesString != "") {
      sql = sql + " insert into user_pause (fk_user_heure_mission, debut, fin) values " + valuesString.slice(0, -1) + "; ";
    }


    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }*/

  setContratToVu(contractId) {
    let sql = "update user_contrat set vu = 'Oui' where pk_user_contrat = '" + contractId + "'; ";

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          resolve(data);
        });
    });
  }

  signSchedule(contract) {
    var sql: any;
    if (this.projectTarget == "jobyer") {
      sql = "update user_contrat set releve_jobyer = 'Oui' where pk_user_contrat = '" + contract.pk_user_contrat + "'; ";
    } else {
      sql = "update user_contrat set approuve = 'Oui' where pk_user_contrat = '" + contract.pk_user_contrat + "'; ";
    }

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          resolve(data);
        });
    });
  }

  emargement(demand : any) {
    let payload = {
      'class': 'fr.protogen.masterdata.model.CCallout',
      'id': 10000,
      'args': [
        {
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'Demand',
          value: btoa(JSON.stringify(demand))
        }
      ]
    };

    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers = Configs.getHttpJsonHeaders();

      this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {

          resolve(data);
        });
    });
  }

  endOfMission(idContrat) {
    let env = btoa(Configs.env);
    let payload = {
      'class': 'fr.protogen.masterdata.model.CCallout',
      'id': 234,
      'args': [
        {
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'ID Contract',
          value: btoa(idContrat + "")
        },
        {
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'Environment',
          value: env
        }
      ]
    };

    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers = Configs.getHttpJsonHeaders();

      this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {

          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;
          resolve(this.data);
        });
    });


  }

  validateWork(invoice) {
    let payload = {
      'class': 'fr.protogen.masterdata.model.CCallout',
      'id': 205,
      'args': [
        {
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'Contrat',
          value: btoa(JSON.stringify(invoice))
        }
      ]
    };

    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers = Configs.getHttpJsonHeaders();

      this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;
          if (data.code == '00000') {
            this.updateContractWithInvoice(invoice);
          }
          resolve(this.data);
        });
    });
  }

  updateContractWithInvoice(invoice) {

    let sql = "update user_contrat set date_paiement_client='" + this.sqlfyDate(new Date()) + "', montant_a_payer_par_client=" + invoice.amount + ", montant_paye_par_client=" + invoice.amount + " " +
      "where numero='" + invoice.contractReference + "'";
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  signContract(contractId) {
    var sql = "update user_contrat set signature_jobyer = 'Oui' where pk_user_contrat = '" + contractId + "'; ";

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  updateOptionMission(selectedOption, contractId) {
    var sql = "update user_contrat set option_mission = '" + selectedOption + "' where pk_user_contrat = '" + contractId + "'; ";

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  updateDefaultOptionMission(selectedOption, accountId, entrepriseId) {
    var sql = "update user_account set option_mission = '" + selectedOption + "' where pk_user_account = '" + accountId + "'; ";

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  schedulePointeuse(contract, missionHours, missionPauses) {
    var notifArray = [];
    var j = missionHours.length;
    var l = 2 * j
    var nextPointing;
    for (var i = 0; i < missionHours.length; i++) {
      var year = new Date(missionHours[i].jour_debut).getFullYear();
      var month = new Date(missionHours[i].jour_debut).getMonth();
      var day = new Date(missionHours[i].jour_debut).getDate();
      var startH = this.convertToFormattedHour(missionHours[i].heure_debut).split(':');
      var endH = this.convertToFormattedHour(missionHours[i].heure_fin).split(':');

      nextPointing = {id: missionHours[i].id, start: true};
      console.log('startNotif', year, month, day, startH);
      var startNotif = {
        //   id: i + 1,
        //   text: "Vous devez pointer l'heure de début de mission planifiée pour " + startH[0] + ":" + startH[1],
        //   at: new Date(year, month, day, startH[0], startH[1]),
        //   data: {contract: contract, nextPointing: nextPointing}
      };
      nextPointing = {id: missionHours[i].id, start: false};
      console.log('endNotif', year, month, day, endH);
      var endNotif = {
        //   id: j + 1,
        //   text: "Vous devez pointer l'heure de fin de mission planifiée pour " + endH[0] + ":" + endH[1],
        //   at: new Date(year, month, day, endH[0], endH[1]),
        //   data: {contract: contract, nextPointing: nextPointing}
      };

      notifArray.push(startNotif);
      notifArray.push(endNotif);
      j++;

      if (missionPauses[i]) {
        for (var k = 0; k < missionPauses[i].length; k++) {
          var year = new Date(missionHours[i].jour_debut).getFullYear();
          var month = new Date(missionHours[i].jour_debut).getMonth();
          var day = new Date(missionHours[i].jour_debut).getDate();
          let startH: string[] = missionPauses[i][k].pause_debut.split(':');
          let endH: string[] = missionPauses[i][k].pause_fin.split(':');

          nextPointing = {id: missionHours[i].id, start: true, id_pause: missionPauses[i][k].id};
          console.log('startNotifPause', year, month, day, startH);
          var startNotifPause = {
            // id: l + 1,
            // text: "Vous devez pointer l'heure de début de pause planifiée pour " + startH[0] + ":" + startH[1],
            // at: new Date(year, month, day, startH[0], startH[1]),
            // data: {contract: contract, nextPointing: nextPointing}
          };
          nextPointing = {id: missionHours[i].id, start: false, id_pause: missionPauses[i][k].id};
          console.log('endNotifPause', year, month, day, endH);
          var endNotifPause = {
            // id: l + 2,
            // text: "Vous devez pointer l'heure de fin de pause planifiée pour " + endH[0] + ":" + endH[1],
            // at: new Date(year, month, day, endH[0], endH[1]),
            // data: {contract: contract, nextPointing: nextPointing}
          };

          notifArray.push(startNotifPause);
          notifArray.push(endNotifPause);
          l = l + 2;
        }
      }
    }

    // TODO Notification
    // LocalNotifications.schedule(notifArray);
    /*LocalNotifications.schedule({
     at:new Date(2016, 6, 12, 18, 43),
     id:1,
     text:"Vous devez pointer l'heure de début de mission planifié pour 10:30",
     title:"Notification",
     data: {hour: "10:30"}
     });*/
  }

  savePointing(pointing, isStart, isPause) {
    var sql;
    if (isPause) {
      if (isStart) {
        sql = "update user_pause set debut_pointe = '" + pointing.pointe + "' where pk_user_pause = '" + pointing.id + "'";
      } else {
        sql = "update user_pause set fin_pointe = '" + pointing.pointe + "' where pk_user_pause = '" + pointing.id + "'";
      }
    } else {
      if (isStart) {
        sql = "update user_heure_mission set date_debut_pointe = '" + pointing.pointe + "' where pk_user_heure_mission = '" + pointing.id + "'";
      } else {
        sql = "update user_heure_mission set date_fin_pointe = '" + pointing.pointe + "' where pk_user_heure_mission = '" + pointing.id + "'";
      }
    }
    console.log(sql);

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  saveModifiedPointing(id, date, isDayMission, isStart) {
    let sql;
    if (isDayMission && isStart) {
      sql = "update user_heure_mission set date_debut_pointe_modifie = '" + date + "' where pk_user_heure_mission = '" + id + "'";
    }
    if (isDayMission && !isStart) {
      sql = "update user_heure_mission set date_fin_pointe_modifie = '" + date + "' where pk_user_heure_mission = '" + id + "'";
    }

    /*if (isPause) {
      if (isStart) {
        //sql = "update user_pause set debut_pointe = '" + date + "' where pk_user_pause = '" + id + "'";
      } else {
        //sql = "update user_pause set fin_pointe = '" + date + "' where pk_user_pause = '" + id + "'";
      }
    } */

    console.log(sql);

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          resolve(data);
        });
    });
  }

  saveCorrectedMissions(id, missionHours, pauseHours, isPointing, optionMission: number) {
    let sql = "";
    if(isPointing) {
      for (var i = 0; i < missionHours.length; i++) {
        var m = missionHours[i];
        var str = "";
        if (m.heure_debut_corrigee && m.heure_debut_corrigee != "") {
          str = " date_debut_pointe = '" + this.convertHoursToMinutes(m.heure_debut_corrigee) + "', debut_corrigee = 'Oui' ";
          sql = sql + " update user_heure_mission set " + str + " where pk_user_heure_mission = '" + m.id + "'; ";
        }

        if (m.heure_fin_corrigee && m.heure_fin_corrigee != "") {
          str = " date_fin_pointe = '" + this.convertHoursToMinutes(m.heure_fin_corrigee) + "', fin_corrigee = 'Oui' ";
          sql = sql + " update user_heure_mission set " + str + " where pk_user_heure_mission = '" + m.id + "'; ";
        }

        //sql request for pauses
        if (pauseHours[i]) {
          for (var j = 0; j < pauseHours[i].length; j++) {
            var p = pauseHours[i][j];
            var str = "";
            if (p.pause_debut_corrigee && p.pause_debut_corrigee != "") {
              str = " debut_pointe = '" + this.convertHoursToMinutes(p.pause_debut_corrigee) + "', debut_corrigee = 'Oui' ";
              sql = sql + " update user_pause set " + str + " where pk_user_pause = '" + p.id + "'; ";
            }
            if (p.pause_fin_corrigee && p.pause_fin_corrigee != "") {
              str = " fin_pointe = '" + this.convertHoursToMinutes(p.pause_fin_corrigee) + "', fin_corrigee = 'Oui' ";
              sql = sql + " update user_pause set " + str + " where pk_user_pause = '" + p.id + "'; ";
            }
          }
        }
      }
    }else{
      if(optionMission == 4){
        for (let i = 0; i < missionHours.length; i++) {
          let m: HeureMission = missionHours[i];
          let startDate = (Utils.isEmpty(m.date_debut_new) ? ( DateUtils.sqlfyWithHours(DateUtils.setMinutesToDate(new Date(m.jour_debut), m.heure_debut))) : ( DateUtils.sqlfyWithHours(DateUtils.reconvertFormattedDateHour(m.date_debut_new))));
          let endDate = (Utils.isEmpty(m.date_fin_new) ? ( DateUtils.sqlfyWithHours(DateUtils.setMinutesToDate(new Date(m.jour_fin), m.heure_fin))) : ( DateUtils.sqlfyWithHours(DateUtils.reconvertFormattedDateHour(m.date_fin_new))));

          let str = " debut_corrigee='NON', fin_corrigee='NON', " +
            " date_debut_pointe = '" + startDate + "', " +
            " date_fin_pointe = '" + endDate + "', " +
            " date_debut_pointe_corrige = '" + startDate + "', " +
            " date_fin_pointe_corrige = '" + endDate + "' ";

          sql = sql + " update user_heure_mission set " + str + " where pk_user_heure_mission = '" + m.id + "'; ";
        }
      }else{
        for (let i = 0; i < missionHours.length; i++) {
          let m = missionHours[i];
          let str = " debut_corrigee='NON', fin_corrigee='NON', " +
            " date_debut_pointe = '" + DateUtils.sqlfyWithHours(DateUtils.setMinutesToDate(new Date(m.jour_debut), m.heure_debut)) + "', " +
            " date_fin_pointe = '" + DateUtils.sqlfyWithHours(DateUtils.setMinutesToDate(new Date(m.jour_fin), m.heure_fin)) + "', " +
            " date_debut_pointe_corrige = '" + DateUtils.sqlfyWithHours(DateUtils.setMinutesToDate(new Date(m.jour_debut), m.heure_debut)) + "', " +
            " date_fin_pointe_corrige = '" + DateUtils.sqlfyWithHours(DateUtils.setMinutesToDate(new Date(m.jour_fin), m.heure_fin)) + "' ";

          sql = sql + " update user_heure_mission set " + str + " where pk_user_heure_mission = '" + m.id + "'; ";
        }
      }
    }

    sql = sql + " update user_contrat set releve_employeur = 'Oui' where pk_user_contrat = '" + id + "'; ";
    console.log(sql);
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          resolve(data);
        });
    });
  }

  sendInfoBySMS(tel, message) {
    tel = tel.replace('+', '00');
    let url = Configs.smsURL;
    let payload = "<fr.protogen.connector.model.SmsModel>"
      + "<telephone>" + tel + "</telephone>"
      + "<text>" + message + "</text>"
      + "</fr.protogen.connector.model.SmsModel>";

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpXmlHeaders();
      this.http.post(url, payload, {headers: headers})
        .subscribe((data: any) => {
          this.data = data;
          console.log(this.data);
          resolve(this.data);
        });
    })
  }

  getTelByJobyer(id) {
    var sql = "select a.telephone from user_account as a, user_jobyer as j where a.pk_user_account = j.fk_user_account and j.pk_user_jobyer = '" + id + "'";
    console.log(sql);

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  getTelByEmployer(id) {
    var sql = "select a.telephone from user_account as a, user_entreprise as e where a.pk_user_account = e.fk_user_account and e.pk_user_entreprise = '" + id + "'";
    console.log(sql);

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  saveCorrectedHour(day, isDayMission, isStart, isCorrected, date) {
    let sql;
    if (isDayMission && isStart) {
      sql = "update user_heure_mission set date_debut_pointe_corrige = '" + date + "', debut_corrigee = '" + isCorrected + "' where pk_user_heure_mission = '" + day.id + "'";
    }
    if (isDayMission && !isStart) {
      sql = "update user_heure_mission set date_fin_pointe_corrige = '" + date + "', fin_corrigee = '" + isCorrected + "' where pk_user_heure_mission = '" + day.id + "'";
    }

    /*if (isStartPause) {
      sql = "update user_pause set debut_corrigee = '" + isCorrected + "' where pk_user_pause = '" + id + "'";
    } else {
      if (j >= 0) {
        sql = "update user_pause set fin_corrigee = '" + isCorrected + "' where pk_user_pause = '" + id + "'";
      }
    }*/

    console.log(sql);
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  saveNewHour(id, date, isDayMission, isStart) {
    let sql;
    if (isDayMission && isStart) {
      sql = "update user_heure_mission set date_debut_new = '" + date + "' where pk_user_heure_mission = '" + id + "'";
    }
    if (isDayMission && !isStart) {
      sql = "update user_heure_mission set date_fin_new = '" + date + "' where pk_user_heure_mission = '" + id + "'";
    }

    console.log(sql);
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          resolve(data);
        });
    });
  }

  saveJobyerAppreciation(day, isDayMission, isStart, isLiked) {
    let sql;
    if (isDayMission && isStart) {
      sql = "update user_heure_mission set est_heure_debut_aime = '" + isLiked + "' where pk_user_heure_mission = '" + day.id + "'";
    }
    if (isDayMission && !isStart) {
      sql = "update user_heure_mission set est_heure_fin_aime = '" + isLiked + "' where pk_user_heure_mission = '" + day.id + "'";
    }

    console.log(sql);
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          resolve(data);
        });
    });
  }

  saveNewHours(newHours) {
    if(newHours.length == 0){
      return new Promise(resolve => {
        resolve({status: "success"});
      });
    }
    let sql = "";
    for(let i = 0; i < newHours.length; i++){
      if(newHours[i].isPointe){
        if (newHours[i].isPause && newHours[i].isStart) {
          sql = sql + " update user_pause set debut_pointe = '" + newHours[i].newHour + "', debut_corrigee = 'OUI'  where pk_user_pause = '" + newHours[i].id + "'; ";
        }
        if (newHours[i].isPause && !newHours[i].isStart) {
          sql = sql + " update user_pause set fin_pointe = '" + newHours[i].newHour + "', fin_corrigee = 'OUI'  where pk_user_pause = '" + newHours[i].id + "'; ";
        }
        if (!newHours[i].isPause && newHours[i].isStart) {
          sql = sql + " update user_heure_mission set heure_debut_pointe = '" + newHours[i].newHour + "', debut_corrigee = 'OUI' where pk_user_heure_mission = '" + newHours[i].id + "'; ";
        }
        if (!newHours[i].isPause && !newHours[i].isStart) {
          sql = sql + " update user_heure_mission set heure_fin_pointe = '" + newHours[i].newHour + "', fin_corrigee = 'OUI' where pk_user_heure_mission = '" + newHours[i].id + "'; ";
        }
      }else{
        if (newHours[i].isPause && newHours[i].isStart) {
          sql = sql + " update user_pause set debut_new = '" + newHours[i].newHour + "' where pk_user_pause = '" + newHours[i].id + "'; ";
        }
        if (newHours[i].isPause && !newHours[i].isStart) {
          sql = sql + " update user_pause set fin_new = '" + newHours[i].newHour + "' where pk_user_pause = '" + newHours[i].id + "'; ";
        }
        if (!newHours[i].isPause && newHours[i].isStart) {
          sql = sql + " update user_heure_mission set heure_debut_new = '" + newHours[i].newHour + "' where pk_user_heure_mission = '" + newHours[i].id + "'; ";
        }
        if (!newHours[i].isPause && !newHours[i].isStart) {
          sql = sql + " update user_heure_mission set heure_fin_new = '" + newHours[i].newHour + "' where pk_user_heure_mission = '" + newHours[i].id + "'; ";
        }
      }
    }
    console.log(sql);
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  deleteNewHour(i, j, isStartMission, isStartPause, id) {
    var sql;
    if (isStartPause) {
      sql = "update user_pause set debut_new = null where pk_user_pause = '" + id + "'";
    } else {
      if (j >= 0) {
        sql = "update user_pause set fin_new = null where pk_user_pause = '" + id + "'";
      }
    }
    if (isStartMission) {
      sql = "update user_heure_mission set heure_debut_new = null where pk_user_heure_mission = '" + id + "'";
    } else {
      if (!j && j != 0) {
        sql = "update user_heure_mission set heure_fin_new = null where pk_user_heure_mission = '" + id + "'";
      }
    }
    console.log(sql);
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  signEndOfMission(bean) {
    let dataSign = JSON.stringify(bean);

    // Compute ID according to env
    let calloutId = 339;
    if (Configs.env == 'PROD') {
      calloutId = 10003;
    }

    var payload = {
      'class': 'fr.protogen.masterdata.model.CCallout',
      'id': calloutId,
      'args': [
        {
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'Signature electronique',
          value: btoa(dataSign)
        }
      ]
    };

    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers = Configs.getHttpJsonHeaders();

      this.http.post(Configs.yousignURL, JSON.stringify(payload), {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;
          console.log(this.data);
          resolve(this.data);
        });
    });
  }

  generatePayement(contractId, month) {
    let data = {
      'class': 'fr.protogen.masterdata.model.CCallout',
      'id': 234,
      'args': [
        {
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'ID Contract',
          value: btoa(contractId + "")
        },
        {
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'Environment',
          value: Configs.env
        },
        {
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'Stage',
          value: 'EOM'
        },
        {
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'Month',
          value: month
        }
      ]
    };
    let stringData = JSON.stringify(data);
    return new Promise(resolve => {
      let headers = Configs.getHttpJsonHeaders();
      this.http.post(Configs.calloutURL, stringData, {headers: headers})
        .subscribe((data: any)=> {
          resolve(data);
        });
    });
  }

  convertToFormattedHour(value) {
    var hours = Math.floor(value / 60);
    var minutes = value % 60;
    if(hours == 0 && minutes == 0){
      return "00:00";
    }else if (!hours && !minutes) {
      return '';
    } else {
      return ((hours < 10 ? ('0' + hours) : hours) + ':' + (minutes < 10 ? ('0' + minutes) : minutes));
    }
  }

  convertHoursToMinutes(hour) {
    if (hour) {
      var hourArray = hour.split(':');
      return hourArray[0] * 60 + parseInt(hourArray[1]);
    }
  }

  sqlfyDate(date) {
    let s = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00+00';
    return s;
  }

  /**
   * get consigners' names by contract
   * @params contract
   */
  getCosignersNames(contract) {
    var sql = "select nom_ou_raison_sociale as enterprise, prenom as jobyer " +
      "from user_entreprise, user_jobyer " +
      "where pk_user_entreprise = " + contract.fk_user_entreprise + " and pk_user_jobyer = " + contract.fk_user_jobyer + " ";
    console.log(sql);

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });

  }

  saveEndMission(id, nbWorkHours, jobyerId) {
    let sql = "update user_contrat set accompli = 'Oui' where pk_user_contrat = '" + id + "'; ";
    sql = sql + " update user_jobyer set nb_heure_travail_vit_on_job = nb_heure_travail_vit_on_job + " + nbWorkHours + " where pk_user_jobyer = '" + jobyerId + "'; ";

    return new Promise(resolve => {
      this.http.post(this.configuration.sqlURL, sql, {headers: Configs.getHttpTextHeaders()})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  calculateNbWorkHours(missionHours){
    let total = 0;
    for(let i = 0; i < missionHours.length; i++){
      total = total + (missionHours[i].heure_fin - missionHours[i].heure_debut);
    }
    return total;
  }

  cancelMission(id, role) {
    var sql = "update user_contrat set annule_par = '" + role + "' where pk_user_contrat = '" + id + "'; ";

    return new Promise(resolve => {
      this.http.post(this.configuration.sqlURL, sql, {headers: Configs.getHttpTextHeaders()})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  getOptionMission(id) {
    var sql = "select option_mission from user_account where pk_user_account = '" + id + "'; ";

    return new Promise(resolve => {
      this.http.post(this.configuration.sqlURL, sql, {headers: Configs.getHttpTextHeaders()})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  getTodayMission(missionHoursTemp){
    let now = new Date().setHours(0, 0, 0, 0);
    let missionHoursToday = [];
    for(let i = 0; i < missionHoursTemp.length; i++){
      if(new Date(missionHoursTemp[i].jour_debut.replace(' ', 'T')).setHours(0, 0, 0, 0) == now || new Date(missionHoursTemp[i].jour_fin.replace(' ', 'T')).setHours(0, 0, 0, 0) == now){
        missionHoursToday.push(missionHoursTemp[i]);
      }
    }
    let array = this.constructMissionHoursArray(missionHoursToday);
    return array;
  }

  disablePointing(missionHours, missionPauses){
    let disabled = true;
    let h = new Date().getHours();
    let m = new Date().getMinutes();
    let minutesNow = this.convertHoursToMinutes(h+':'+m);
    for(let i = 0; i < missionHours.length; i++){
      let scheduledHour = Utils.isEmpty(missionHours[i].heure_debut_new) ? missionHours[i].heure_debut : missionHours[i].heure_debut_new;
      if(scheduledHour - minutesNow <=  10 && scheduledHour - minutesNow >=  0 && Utils.isEmpty(missionHours[i].date_debut_pointe)){
        disabled = false;
        let nextPointing = {id: missionHours[i].id, start: true};
        return {disabled: disabled, nextPointing: nextPointing};
      }
      scheduledHour = Utils.isEmpty(missionHours[i].heure_fin_new) ? missionHours[i].heure_fin : missionHours[i].heure_fin_new;
      if(scheduledHour - minutesNow <=  10 && scheduledHour - minutesNow >=  0 && (Utils.isEmpty(missionHours[i].date_fin_pointe))){
        disabled = false;
        let nextPointing = {id: missionHours[i].id, start: false};
        return {disabled: disabled, nextPointing: nextPointing};
      }
      for(let j = 0; j < missionPauses[i].length; j++){
        let p = missionPauses[i][j];
        let minutesPause;
        if(Utils.isEmpty(p.pause_debut_new)){
          let h = (p.pause_debut).split(":")[0];
          let m = (p.pause_debut).split(":")[1];
          minutesPause = this.convertHoursToMinutes(h+':'+m);
        }else{
          minutesPause = p.pause_debut_new;
        }
        if(minutesPause - minutesNow <=  10 && minutesPause - minutesNow >=  0 && Utils.isEmpty(p.pause_debut_pointe)){
          disabled = false;
          let nextPointing = {id: missionHours[i].id, start: true, id_pause: p.id};
          return {disabled: disabled, nextPointing: nextPointing};
        }
        if(Utils.isEmpty(p.pause_fin_new)){
          let h = (p.pause_fin).split(":")[0];
          let m = (p.pause_fin).split(":")[1];
          let minutesPause = this.convertHoursToMinutes(h+':'+m);
        }else{
          minutesPause = p.pause_fin_new;
        }
        if(minutesPause - minutesNow <=  10 && minutesPause - minutesNow >=  0 && Utils.isEmpty(p.pause_fin_pointe)){
          disabled = false;
          let nextPointing = {id: missionHours[i].id, start: false, id_pause: p.id};
          return {disabled: disabled, nextPointing: nextPointing};
        }
      }
    }
    return {disabled: disabled, nextPointing: null};
  }

  getPrerequisObligatoires(idContrat){
    let sql = "select libelle from user_prerquis where pk_user_prerquis " +
      "in (select fk_user_prerquis from user_prerequis_obligatoires where fk_user_offre_entreprise " +
      "in (" +
      "select fk_user_offre_entreprise from user_contrat where pk_user_contrat="+idContrat +
      ")" +
      ")";
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          let d = [];
          if(data.data)
            d = data.data;
          resolve(d);
        });
    });
  }

  getMissionById(contractId, roleId, projectTarget){
    let sql = "";
    if (projectTarget == 'employer') {
      sql= " SELECT c.pk_user_contrat , c.*, " +
        "j.nom, j.prenom, " +
        "a.telephone " +
        "FROM user_contrat as c, user_jobyer as j, user_account as a " +
        "WHERE c.fk_user_jobyer = j.pk_user_jobyer " +
        "AND j.fk_user_account = a.pk_user_account " +
        "AND c.fk_user_entreprise ='" + roleId + "' " +
        "AND c.pk_user_contrat = '" + contractId + "'";
    }else{
      sql = "SELECT c.pk_user_contrat, c.*, e.nom_ou_raison_sociale as nom FROM user_contrat as c, user_entreprise as e " +
        "WHERE c.fk_user_entreprise = e.pk_user_entreprise " +
        "AND c.fk_user_jobyer ='" + roleId + "' " +
        "AND c.pk_user_contrat = '" + contractId + "'";
    }

    console.log(sql);
    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }
}
