export async function readExcel(file){
 const XLSX=await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm");
 const data=await file.arrayBuffer(); const wb=XLSX.read(data,{type:"array"}); const sheet=wb.Sheets[wb.SheetNames[0]];
 return XLSX.utils.sheet_to_json(sheet,{defval:""});
}
export function validateRows(rows){
 const required=["الدرجة","التخصص","المستوى","المقرر","اليوم","اسم المدرس","من","الى","القاعة"];
 return rows.map((r,i)=>({row:i+2,missing:required.filter(k=>String(r[k]??"").trim()===""),data:r}))
}
export async function exportExcel(rows,filename="export.xlsx"){
 const XLSX=await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm");
 const ws=XLSX.utils.json_to_sheet(rows),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"البيانات");XLSX.writeFile(wb,filename);
}
