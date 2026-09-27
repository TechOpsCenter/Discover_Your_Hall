export async function createPdfFromElement(el,filename){
  const [{default:html2canvas},{jsPDF}]=await Promise.all([
    import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm"),
    import("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm")
  ]);
  const canvas=await html2canvas(el,{scale:2,backgroundColor:"#ffffff",useCORS:true});
  const pdf=new jsPDF({orientation:canvas.width>canvas.height?"landscape":"portrait",unit:"mm",format:"a4"});
  const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight(), margin=8;
  const ratio=Math.min((pw-margin*2)/canvas.width,(ph-margin*2)/canvas.height);
  const w=canvas.width*ratio,h=canvas.height*ratio;
  pdf.addImage(canvas.toDataURL("image/png"),"PNG",margin,(ph-h)/2,w,h);
  pdf.save(filename.replace(/[\\/:*?"<>|]/g,"_"));
}
