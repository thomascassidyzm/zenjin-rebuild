#!/usr/bin/env node
/**
 * YAML APML to TypeScript Interface Generator
 * Generates TypeScript interfaces from APML v2.2 YAML definitions
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure paths
const YAML_APML_DIR = path.join(__dirname, '..', 'docs', 'build', 'apml', 'interfaces-yaml');
const TS_OUTPUT_DIR = path.join(__dirname, '..', 'src', 'interfaces');

// Ensure output directory exists
if (!fs.existsSync(TS_OUTPUT_DIR)) {
  fs.mkdirSync(TS_OUTPUT_DIR, { recursive: true });
}

/**
 * Convert APML type to TypeScript type
 */
function convertType(apmlType, isArray = false) {
  const typeMap = {
    'string': 'string',
    'number': 'number',
    'integer': 'number',
    'boolean': 'boolean',
    'object': 'Record<string, any>',
    'array': 'any[]',
    'any': 'any',
    'void': 'void'
  };
  
  const tsType = typeMap[apmlType] || apmlType;
  return isArray ? `${tsType}[]` : tsType;
}

/**
 * Generate TypeScript property from APML property
 */
function generateProperty(name, prop, indent = '  ') {
  let ts = '';
  
  // Add JSDoc comment if description exists
  if (prop.description) {
    ts += `${indent}/** ${prop.description} */\n`;
  }
  
  // Property name with optional marker
  const optional = prop.required === false ? '?' : '';
  ts += `${indent}${name}${optional}: `;
  
  // Handle array types
  if (prop.type === 'array' && prop.items) {
    ts += `${convertType(prop.items.type || prop.items)}[]`;
  }
  // Handle object types with properties
  else if (prop.type === 'object' && prop.properties) {
    ts += '{\n';
    Object.entries(prop.properties).forEach(([propName, propDef]) => {
      ts += generateProperty(propName, propDef, indent + '  ');
    });
    ts += `${indent}}`;
  }
  // Simple types
  else {
    ts += convertType(prop.type);
  }
  
  ts += ';\n';
  return ts;
}

/**
 * Generate TypeScript interface from APML type definition
 */
function generateInterface(name, typeDef) {
  let ts = '';
  
  // Add description as JSDoc
  if (typeDef.description) {
    ts += `/**\n * ${typeDef.description}\n */\n`;
  }
  
  ts += `export interface ${name} {\n`;
  
  // Generate properties
  if (typeDef.properties) {
    Object.entries(typeDef.properties).forEach(([propName, propDef]) => {
      ts += generateProperty(propName, propDef);
    });
  }
  
  ts += '}\n\n';
  return ts;
}

/**
 * Generate TypeScript enum from APML errors
 */
function generateErrorEnum(interfaceName, errors) {
  const enumName = `${interfaceName.replace('Interface', '')}ErrorCode`;
  let ts = `/**\n * Error codes for ${interfaceName}\n */\n`;
  ts += `export enum ${enumName} {\n`;
  
  Object.keys(errors).forEach(errorKey => {
    ts += `  ${errorKey} = '${errorKey}',\n`;
  });
  
  ts += '}\n\n';
  return ts;
}

/**
 * Generate method signature from APML method definition
 */
function generateMethod(name, method, errorDefs, indent = '  ') {
  let ts = '';
  
  // Add JSDoc
  ts += `${indent}/**\n`;
  ts += `${indent} * ${method.description}\n`;
  
  // Document parameters
  if (method.parameters) {
    Object.entries(method.parameters).forEach(([paramName, param]) => {
      ts += `${indent} * @param ${paramName} - ${param.description || paramName}\n`;
    });
  }
  
  // Document return type
  if (method.returns) {
    ts += `${indent} * @returns ${method.returns.description || 'Result'}\n`;
  }
  
  // Document errors
  if (method.errors && method.errors.length > 0) {
    method.errors.forEach(error => {
      ts += `${indent} * @throws ${error} if ${errorDefs?.[error]?.message || error}\n`;
    });
  }
  
  ts += `${indent} */\n`;
  
  // Method signature
  ts += `${indent}${name}(`;
  
  // Parameters
  if (method.parameters) {
    const params = Object.entries(method.parameters).map(([paramName, param]) => {
      const optional = param.required === false ? '?' : '';
      return `${paramName}${optional}: ${convertType(param.type)}`;
    });
    ts += params.join(', ');
  }
  
  ts += '): ';
  
  // Return type
  if (method.returns) {
    if (method.returns.type === 'object' && method.returns.properties) {
      ts += '{ ';
      const props = Object.entries(method.returns.properties).map(([propName, prop]) => {
        return `${propName}: ${convertType(prop.type)}`;
      });
      ts += props.join('; ');
      ts += ' }';
    } else {
      ts += convertType(method.returns.type);
    }
  } else {
    ts += 'void';
  }
  
  // Add Promise wrapper if async
  if (method.async) {
    const returnType = ts.substring(ts.lastIndexOf(':') + 2);
    ts = ts.substring(0, ts.lastIndexOf(':') + 2) + `Promise<${returnType}>`;
  }
  
  ts += ';\n\n';
  return ts;
}

/**
 * Convert YAML APML to TypeScript
 */
async function convertYamlToTypeScript(yamlFile) {
  try {
    // Read and parse YAML
    const yamlContent = await fs.promises.readFile(yamlFile, 'utf8');
    const apml = yaml.load(yamlContent);
    
    const interfaceName = apml.interface_metadata.name;
    let ts = '';
    
    // File header
    ts += `/**\n`;
    ts += ` * ${interfaceName}.ts\n`;
    ts += ` * Generated from APML Interface Definition\n`;
    ts += ` * Module: ${apml.interface_metadata.module}\n`;
    ts += ` */\n\n`;
    
    // Import dependencies
    if (apml.interface_metadata.dependencies) {
      apml.interface_metadata.dependencies.forEach(dep => {
        if (dep && dep !== '[object Object]') {
          ts += `import { ${dep} } from './${dep}';\n`;
        }
      });
      ts += '\n';
    }
    
    // Add description as JSDoc
    if (apml.interface_metadata.description) {
      ts += `/**\n * ${apml.interface_metadata.description.trim().replace(/\n/g, '\n * ')}\n */\n`;
    }
    
    // Generate type interfaces
    if (apml.types) {
      Object.entries(apml.types).forEach(([typeName, typeDef]) => {
        ts += generateInterface(typeName, typeDef);
      });
    }
    
    // Generate error enum
    if (apml.errors) {
      ts += generateErrorEnum(interfaceName, apml.errors);
    }
    
    // Generate main interface
    if (apml.interface && apml.interface[interfaceName]) {
      ts += `/**\n * ${interfaceName}\n */\n`;
      ts += `export interface ${interfaceName} {\n`;
      
      // Generate methods
      if (apml.interface[interfaceName].methods) {
        Object.entries(apml.interface[interfaceName].methods).forEach(([methodName, method]) => {
          ts += generateMethod(methodName, method, apml.errors);
        });
      }
      
      ts += '}\n\n';
    }
    
    // Export default
    ts += `// Export default interface\n`;
    ts += `export default ${interfaceName};\n`;
    
    return ts;
  } catch (error) {
    console.error(`Error converting ${yamlFile}: ${error.message}`);
    throw error;
  }
}

/**
 * Main generation process
 */
async function main() {
  try {
    console.log('YAML APML to TypeScript Generator');
    console.log('=================================');
    console.log(`Source: ${YAML_APML_DIR}`);
    console.log(`Output: ${TS_OUTPUT_DIR}\n`);
    
    // Find all YAML APML files
    const files = await fs.promises.readdir(YAML_APML_DIR);
    const yamlFiles = files.filter(file => file.endsWith('.apml'));
    
    console.log(`Found ${yamlFiles.length} YAML APML files to process.\n`);
    
    // Process each file
    let successCount = 0;
    for (const file of yamlFiles) {
      const yamlPath = path.join(YAML_APML_DIR, file);
      console.log(`Processing ${file}...`);
      
      try {
        const tsContent = await convertYamlToTypeScript(yamlPath);
        const tsFileName = file.replace('.apml', '.ts');
        const tsPath = path.join(TS_OUTPUT_DIR, tsFileName);
        
        await fs.promises.writeFile(tsPath, tsContent);
        console.log(`✓ Generated ${tsFileName}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed: ${error.message}`);
      }
    }
    
    console.log(`\nGeneration complete! Successfully generated ${successCount}/${yamlFiles.length} interfaces.`);
    
    // Update index.ts
    await updateIndexFile(yamlFiles);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

/**
 * Update the index.ts file with all generated interfaces
 */
async function updateIndexFile(yamlFiles) {
  try {
    const indexPath = path.join(TS_OUTPUT_DIR, 'index.ts');
    let indexContent = '/**\n * Generated TypeScript interfaces from APML Interface Definitions\n */\n\n';
    
    // Get all interface names
    const interfaceNames = yamlFiles
      .filter(file => file.endsWith('.apml'))
      .map(file => file.replace('.apml', ''))
      .sort();
    
    // Generate exports
    interfaceNames.forEach(name => {
      indexContent += `export { default as ${name} } from './${name}';\n`;
    });
    
    await fs.promises.writeFile(indexPath, indexContent);
    console.log('✓ Updated index.ts');
  } catch (error) {
    console.error('Failed to update index.ts:', error.message);
  }
}

// Run the generator
main();