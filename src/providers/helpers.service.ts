import {Injectable} from "@angular/core";
// import {isUndefined} from "ionic-angular/util";

/**
 * @author amine daoudi
 * @description a service for global helpers functions
 */

@Injectable()
export class Helpers {
  constructor() {

  }

  parseDate(dateStr: string) {
    if (!dateStr || dateStr.length == 0 || dateStr.split('-').length == 0)
      return '';
    return dateStr.split('-')[2] + '/' + dateStr.split('-')[1] + '/' + dateStr.split('-')[0];
  }

  /**
   * TODO : Check for usages
   * @description convert date String to sql Timestamp format
   * @param dateStr 'dd/MM/yyyy'
   *
   dateStrToSqlTimestamp(dateStr: string) {
    if (!dateStr || dateStr.length == 0 || dateStr.split('/').length == 0 || dateStr == 'undefined') {
      return 'null';
    }
    var dateParts = dateStr.split('/');
    var day = dateParts[0];
    var month = dateParts[1];
    var year = dateParts[2];

    var date = new Date(year, month, day);
    var sqlTimestamp = date.getUTCFullYear() + '-' +
      ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
      ('00' + date.getUTCDate()).slice(-2) + ' ' +
      ('00' + date.getUTCHours()).slice(-2) + ':' +
      ('00' + date.getUTCMinutes()).slice(-2) + ':' +
      ('00' + date.getUTCSeconds()).slice(-2);
    return "'" + sqlTimestamp + "'";
  }*/


  /**
   * @description convert date to sql Timestamp format
   * @param date Date
   */
  dateToSqlTimestamp(date: Date) {
    if(!date){
      date = new Date();
    }
    var sqlTimestamp = date.getUTCFullYear() + '-' +
      ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
      ('00' + date.getUTCDate()).slice(-2) + ' ' +
      ('00' + date.getUTCHours()).slice(-2) + ':' +
      ('00' + date.getUTCMinutes()).slice(-2) + ':' +
      ('00' + date.getUTCSeconds()).slice(-2);
    return sqlTimestamp;
  }

  displayableDateToSQL(sdate : string){
    if(!sdate || sdate.length == 0){
      return 'null';
    }

    let day = sdate.split('/')[0];
    let month = sdate.split('/')[1];
    let year = sdate.split('/')[2];

    return "'"+year+"-"+month+"-"+day+" 00:00:00+00'";
  }



  /**
   * @description convert time String to minutes
   * @param timeStr 'hh:mm'
   */
  timeStrToMinutes(timeStr: string) {
    if (!timeStr || timeStr.length == 0 || timeStr.split(':').length == 0 || timeStr == 'undefined') {
      return 0;
    }
    var timeParts = timeStr.split(':');
    var hours = parseInt(timeParts[0]);
    var minutes = parseInt(timeParts[1]);

    var totalMinutes = minutes + hours * 60;
    return totalMinutes;
  }


}
