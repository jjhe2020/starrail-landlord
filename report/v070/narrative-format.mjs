function tableCells(line){
 const text=line.trim();if(!text.startsWith('|')||!text.endsWith('|'))return null;
 const cells=[];let cell='',escaped=false;
 for(const character of text.slice(1,-1)){
  if(character==='|'&&!escaped){cells.push(cell.trim());cell='';continue;}
  cell+=character;escaped=character==='\\'&&!escaped;
 }
 cells.push(cell.trim());return cells;
}

/** RichNarrative supports headings/prose; expand two-column tables without changing their text. */
export function readableNarrativeTables(value){
 const lines=String(value??'').split(/\r?\n/),output=[];
 for(let index=0;index<lines.length;index++){
  const headers=tableCells(lines[index]),separator=tableCells(lines[index+1]||'');
  if(headers?.length!==2||separator?.length!==2||!separator.every(cell=>/^:?-{3,}:?$/.test(cell.replace(/\s/g,'')))){output.push(lines[index]);continue;}
  const entries=[];let end=index+2;
  while(end<lines.length){const cells=tableCells(lines[end]);if(cells?.length!==2)break;entries.push(cells);end++;}
  if(!entries.length){output.push(lines[index]);continue;}
  output.push(`${headers[0]} / ${headers[1]}`,'');
  for(const[heading,text]of entries)output.push(`### ${heading}`,'',text,'');
  index=end-1;
 }
 return output.join('\n');
}
