const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/gonza/Documents/BANCO/frontend/src/pages';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if(file.endsWith('.jsx')) {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    // Reemplazar la URL malformada que insertó powershell
    content = content.replace(/http:\/\/:5000/g, 'http://localhost:5000');
    // Ahora reemplazarla correctamente usando comillas invertidas
    content = content.replace(/'http:\/\/localhost:5000([^']+)'/g, '`http://${window.location.hostname}:5000$1`');
    // Para los casos donde ya tenía backticks
    content = content.replace(/`http:\/\/localhost:5000([^`]+)`/g, '`http://${window.location.hostname}:5000$1`');
    fs.writeFileSync(p, content);
  }
});
console.log('Fixed URLs');
