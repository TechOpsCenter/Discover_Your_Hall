export async function exportExcel(rows,filename="بيانات.xlsx"){
 const XLSX=await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm");
 const ws=XLSX.utils.json_to_sheet(rows),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"البيانات");XLSX.writeFile(wb,filename);
}
