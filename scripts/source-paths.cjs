// Local narrative inputs are not deployed. Resolve from the workspace, before or after organization.
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
function narrativePath(name,...parts){
 let cursor=process.env.PORTFOLIO_WORKSPACE_ROOT||path.resolve(__dirname,'..');
 while(true){
  for(const candidate of [path.join(cursor,'03_叙事演示',name),path.join(cursor,name)]){
   if(fs.existsSync(path.join(candidate,'index.html')))return path.join(candidate,...parts);
  }
  const parent=path.dirname(cursor);if(parent===cursor)break;cursor=parent;
 }
 throw new Error(`Narrative source not found: ${name}. Set PORTFOLIO_WORKSPACE_ROOT to the organized workspace root.`);
}
module.exports={narrativePath,narrativeUrl:(name,...parts)=>pathToFileURL(narrativePath(name,...parts)).href};
