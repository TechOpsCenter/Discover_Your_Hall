export function reviewRows(rows){return rows.filter(r=>['college','major','level','course','day','timeFrom','timeTo','room'].some(k=>r[k]==null||r[k]===''));}
