const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('schema2.json', 'utf8'));

console.log("Top level keys:", Object.keys(schema));
if (schema.definitions) console.log("Definitions exist");
if (schema.components) console.log("Components.schemas keys:", Object.keys(schema.components.schemas).length);

function printCols(tableName) {
    const def = schema.definitions ? schema.definitions[tableName] : (schema.components && schema.components.schemas ? schema.components.schemas[tableName] : null);
    if (def && def.properties) {
        console.log(`\n=== ${tableName} ===`);
        for (const [col, info] of Object.entries(def.properties)) {
            console.log(`- ${col}: ${info.type} ${info.format ? '(' + info.format + ')' : ''}`);
        }
    } else {
        console.log(`\n=== ${tableName} not found ===`);
    }
}

printCols('sns_reservations');
printCols('sales');
